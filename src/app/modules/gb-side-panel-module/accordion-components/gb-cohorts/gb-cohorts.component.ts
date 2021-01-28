/**
 * Copyright 2017 - 2018  The Hyve B.V.
 * Copyright 2020 - 2021 CHUV
 * Copyright 2020 EPFL LDS
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, OnInit, ElementRef, ViewEncapsulation, AfterViewInit, ViewChild } from '@angular/core';
import { Cohort } from 'app/models/cohort-models/cohort';
import { PatientListOperationStatus } from 'app/models/cohort-models/patient-list-operation-status';
import { CohortService } from 'app/services/cohort.service';
import { ConstraintService } from 'app/services/constraint.service';
import { SavedCohortsPatientListService } from 'app/services/saved-cohorts-patient-list.service';
import { ErrorHelper } from 'app/utilities/error-helper';
import { ConfirmationService } from 'primeng/api';
import { OverlayPanel } from 'primeng/overlaypanel'


@Component({
  selector: 'gb-cohorts',
  templateUrl: './gb-cohorts.component.html',
  styleUrls: ['./gb-cohorts.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class GbCohortsComponent implements AfterViewInit, OnInit {

  public readonly fileElementId: string = 'cohortFileUpload';
  searchName = '';
  _changes: MutationObserver;

  deletionCandidate: Cohort;

  file: File; // holds the uploaded cohort file
  PatientListOperationStatus = PatientListOperationStatus;

  @ViewChild('op', { static: false }) deletionRequest: OverlayPanel;

  static numberMatrixToCSV(data: number[][]) {
    const csv = data.map((row) => row.toString());
    console.log(csv.join('\r\n'))
    return csv.join('\r\n');
  }

  static savePatientListToCSVFile(patientLists: number[][]) {
    const csvContent = GbCohortsComponent.numberMatrixToCSV(patientLists)

    let exportFileEL = document.createElement('a');
    let blob = new Blob([csvContent], { type: 'text/csv' });
    let url = window.URL.createObjectURL(blob);
    exportFileEL.href = url;
    exportFileEL.download = 'patientList.csv';
    exportFileEL.click();
    window.URL.revokeObjectURL(url);
    exportFileEL.remove();
  }

  constructor(public cohortService: CohortService,
    private constraintService: ConstraintService,
    private confirmationService: ConfirmationService,
    private element: ElementRef,
    private savedCohortsPatientListService: SavedCohortsPatientListService) { }

  get cohorts(): Array<Cohort> {

    return this.cohortService.cohorts
  }
  get selectedCohort(): Cohort {
    return this.cohortService.selectedCohort
  }
  set selectedCohort(cohort: Cohort) {
    this.cohortService.selectedCohort = cohort
  }

  get notAuthorized(): boolean {
    return this.savedCohortsPatientListService.notAuthorized
  }

  get patientListsStatus(): Map<string, PatientListOperationStatus> {
    return this.savedCohortsPatientListService.statusStorage
  }

  ngOnInit() {
    this.refreshCohorts()
  }

  ngAfterViewInit() {
    /*

    this._changes= new MutationObserver(mutation=>console.log('mutation',mutation))
    this._changes.observe(this.element.nativeElement,{
      attributes: true,
      childList: true,
      subtree: false,
      characterData: true
    })
    */


  }

  dragdebug(event: DragEvent, cohort: Cohort) {
    event.dataTransfer.setData('text', 'cohort')


    this.cohortService.selectedCohort = cohort

  }

  refreshCohorts() {
    this.cohortService.getCohorts()
  }



  toggleBookmark(e: Event, cohort: Cohort) {
    e.stopPropagation()
  }

  downloadCohort(e: Event, cohort: Cohort) {
    e.stopPropagation()
    this.savedCohortsPatientListService.getListStatusNotifier(cohort.name).subscribe(
      (x) => { console.log(`New status of request for patient list of saved cohort ${cohort.name}, status: ${x}`) }
    )
    this.savedCohortsPatientListService.getList(cohort.name).subscribe(
      value => { GbCohortsComponent.savePatientListToCSVFile(value) },
      err => {
        throw ErrorHelper.handleError(`While retrieving list for cohort ${cohort.name}`, err)
      }
    )
  }

  restoreCohort(e: Event, cohort: Cohort) {
    e.stopPropagation()
    this.cohortService.selectedCohort = cohort
    this.cohortService.restoreTerms()
  }

  bookmarkCohort(e: Event, cohort: Cohort) {
    e.stopPropagation()
    cohort.bookmarked = !cohort.bookmarked
  }

  sortByName() {
    let sorted = this.cohortService.cohorts.sort((a, b) => (a.name > b.name) ? 1 : -1)
    this.cohortService.cohorts = sorted
  }

  sortByBookmark() {
    let sorted = this.cohortService.cohorts.sort((a, b) => (!b.bookmarked || a.bookmarked) ? -1 : 1)
    this.cohortService.cohorts = sorted
  }
  sortByDate() {
    let sorted = this.cohortService.cohorts.sort((a, b) => (!b.creationDate ||
      a.creationDate && a.creationDate.getTime() > b.creationDate.getTime()
    ) ? -1 : 1)

    this.cohortService.cohorts = sorted
  }


  onFiltering(event: Event) {
    let filterWord = this.searchName.trim().toLowerCase()
    this.cohortService.cohorts.forEach(cohort => {
      cohort.visible = (cohort.name.toLowerCase().indexOf(filterWord) === -1) ? false : true
    })

  }

  visibles(): Array<Cohort> {
    return this.cohorts.filter(cohort => cohort.visible)
  }

  changeSelect(event: Event, cohort: Cohort) {
    event.stopPropagation()
    this.cohortService.selectedCohort = cohort
  }

  remove(event: Event, cohort: Cohort) {
    event.stopPropagation()

    this.deletionCandidate = cohort


    this.confirmationService.confirm({
      message: `Do you want to permanently remove ${this.deletionCandidate.name} ?`,
      header: 'Confirmation',
      icon: null,
      accept: () => {
        this.cohortService.removeCohorts(cohort)
        if (this.cohortService.selectedCohort && this.cohortService.selectedCohort === cohort) {
          this.cohortService.selectedCohort = null
        }
        this.cohortService.cohorts = this.cohortService.cohorts.filter(c => cohort !== c)

      },
      reject: () => {

      }
    });
    this.deletionCandidate = undefined
  }
}
