/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {TestBed} from '@angular/core/testing';
import {CategoricalAggregate} from '../app/models/aggregate-models/categorical-aggregate';
import {ConceptType} from '../app/models/constraint-models/concept-type';
import {TransmartResourceServiceMock} from '../app/services/mocks/transmart-resource.service.mock';
import {CrossTableService} from '../app/services/cross-table.service';
import {ConceptConstraint} from '../app/models/constraint-models/concept-constraint';
import {TransmartCrossTable} from '../app/models/transmart-models/transmart-cross-table';
import {TransmartResourceService} from '../app/services/transmart-services/transmart-resource.service';
import {Observable} from 'rxjs/Observable';
import {Concept} from '../app/models/constraint-models/concept';
import {ResourceService} from '../app/services/resource.service';
import {Constraint} from '../app/models/constraint-models/constraint';
import Spy = jasmine.Spy;
import {TransmartConstraintMapper} from '../app/utilities/transmart-utilities/transmart-constraint-mapper';
import {Study} from '../app/models/constraint-models/study';
import {StudyConstraint} from '../app/models/constraint-models/study-constraint';
import {CombinationConstraint} from '../app/models/constraint-models/combination-constraint';


const mapConstraint = TransmartConstraintMapper.mapConstraint;


function combineCategoricalValueConstraints(conceptCode1: string, value1: string, conceptCode2, value2: string): any {
  return {
    type: 'and', args: [
      {
        type: 'subselection', dimension: 'patient', constraint: {
          type: 'and', args: [
            {type: 'concept', conceptCode: conceptCode1},
            {type: 'value', valueType: 'STRING', operator: '=', value: value1}
          ]
        }
      },
      {
        type: 'subselection', dimension: 'patient', constraint: {
          type: 'and', args: [
            {type: 'concept', conceptCode: conceptCode2},
            {type: 'value', valueType: 'STRING', operator: '=', value: value2}
          ]
        }
      },
    ]
  };
}


/**
 * Test suite that tests the cross table functionality, by calling
 * functions on the cross table service (which holds the cross table data structure),
 * and checking if the expected calls are being made to the tranSMART resource service.
 */
describe('Test cross table retrieval calls for TranSMART', () => {
  let crossTableService: CrossTableService;
  let resourceService: ResourceService;
  let transmartResourceService: TransmartResourceService;
  let aggregateCall: Spy, crossTableCall: Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: TransmartResourceService,
          useClass: TransmartResourceServiceMock
        },
        ResourceService,
        CrossTableService
      ]
    });
    transmartResourceService = TestBed.get(TransmartResourceService);
    resourceService = TestBed.get(ResourceService);
    crossTableService = TestBed.get(CrossTableService);

    aggregateCall = spyOn(resourceService, 'getAggregate')
      .and.callFake((constraint: ConceptConstraint) => {
        let aggregate: CategoricalAggregate = new CategoricalAggregate();
        switch (constraint.concept.code) {
          case 'foo':
            aggregate.valueCounts.set('one', 1);
            aggregate.valueCounts.set('two', 2);
            return Observable.of(aggregate);
          case 'bar':
            aggregate.valueCounts.set('A', 3);
            aggregate.valueCounts.set('B', 4);
            return Observable.of(aggregate);
          default:
            throw new Error('No mock data for the concept');
        }
      });
  });

  it('should retrieve the cross table when adding a concept to the row constraints', () => {
    // Prepare input
    let concept = new Concept();
    concept.type = ConceptType.CATEGORICAL;
    concept.code = 'foo';
    let fooConstraint = new ConceptConstraint();
    fooConstraint.concept = concept;

    // Expected row constraints, to be generated by the service
    let expectedRowConstraints = [
      {type: 'and', args: [
          {type: 'concept', conceptCode: 'foo'},
          {type: 'value', valueType: 'STRING', operator: '=', value: 'one'},
        ]},
      {type: 'and', args: [
          {type: 'concept', conceptCode: 'foo'},
          {type: 'value', valueType: 'STRING', operator: '=', value: 'two'},
        ]}
    ];

    // Prepare checks
    crossTableCall = spyOn(transmartResourceService, 'getCrossTable').and.callFake(
      (baseConstraint: Constraint, rowConstraints: Constraint[], columnConstraints: Constraint[]) => {
        expect(mapConstraint(baseConstraint)).toEqual({type: 'true'});
        expect(rowConstraints.map(constraint => mapConstraint(constraint))).toEqual(expectedRowConstraints);
        expect(columnConstraints.map(constraint => mapConstraint(constraint))).toEqual([{type: 'true'}]);
        let result = new TransmartCrossTable();
        result.rows = [[1], [2]];
        return Observable.of(result);
      });

    // Call the service
    crossTableService.rowConstraints.push(fooConstraint);
    crossTableService.updateValueConstraints([fooConstraint]);

    expect(aggregateCall).toHaveBeenCalled();
    expect(crossTableCall).toHaveBeenCalled();
  });

  /**
   * Test that the proper combination of observation-level and subject-level constraints
   * are being generated when selecting multiple concepts in a cross table dimension.
   */
  it('should retrieve the cross table when adding multiple concepts to the row constraints', () => {
    // Prepare input
    let fooConcept = new Concept();
    fooConcept.type = ConceptType.CATEGORICAL;
    fooConcept.code = 'foo';
    let fooConstraint = new ConceptConstraint();
    fooConstraint.concept = fooConcept;
    let barConcept = new Concept();
    barConcept.type = ConceptType.CATEGORICAL;
    barConcept.code = 'bar';
    let barConstraint = new ConceptConstraint();
    barConstraint.concept = barConcept;

    // Expected row constraints for one concept, to be generated by the service
    let expectedRowConstraints = [
      {type: 'and', args: [
          {type: 'concept', conceptCode: 'foo'},
          {type: 'value', valueType: 'STRING', operator: '=', value: 'one'},
        ]},
      {type: 'and', args: [
          {type: 'concept', conceptCode: 'foo'},
          {type: 'value', valueType: 'STRING', operator: '=', value: 'two'},
        ]}
    ];
    // Dummy result for two rows
    let testRows = [[1], [2]];

    // Prepare checks for the first call
    crossTableCall = spyOn(transmartResourceService, 'getCrossTable').and.callFake(
      (baseConstraint: Constraint, rowConstraints: Constraint[], columnConstraints: Constraint[]) => {
        expect(mapConstraint(baseConstraint)).toEqual({type: 'true'});
        expect(rowConstraints.map(constraint => mapConstraint(constraint))).toEqual(expectedRowConstraints);
        expect(columnConstraints.map(constraint => mapConstraint(constraint))).toEqual([{type: 'true'}]);
        let result = new TransmartCrossTable();
        result.rows = testRows;
        return Observable.of(result);
      });

    // Call the service
    crossTableService.rowConstraints.push(fooConstraint);
    crossTableService.updateValueConstraints([fooConstraint]);

    expect(aggregateCall).toHaveBeenCalled();
    expect(crossTableCall).toHaveBeenCalled();

    // Expected row constraints for two concepts, to be generated by the service
    expectedRowConstraints = [
      combineCategoricalValueConstraints('foo', 'one', 'bar', 'A'),
      combineCategoricalValueConstraints('foo', 'one', 'bar', 'B'),
      combineCategoricalValueConstraints('foo', 'two', 'bar', 'A'),
      combineCategoricalValueConstraints('foo', 'two', 'bar', 'B'),
    ];
    // Dummy result for four rows
    testRows = [[1], [2], [3], [4]];

    crossTableService.rowConstraints.push(barConstraint);
    crossTableService.updateValueConstraints([barConstraint]);

    expect(aggregateCall).toHaveBeenCalled();
    expect(crossTableCall).toHaveBeenCalled()
  });

  it('should return a cross table when adding concepts to row and column constraints', () => {
    // Prepare input
    let fooConcept = new Concept();
    fooConcept.type = ConceptType.CATEGORICAL;
    fooConcept.code = 'foo';
    fooConcept.name = 'Foo';
    let fooConstraint = new ConceptConstraint();
    fooConstraint.concept = fooConcept;
    let studyA = new Study();
    studyA.studyId = 'A Study';
    let studyAConstraint = new StudyConstraint();
    studyAConstraint.studies.push(studyA);
    let fooAConstraint = new CombinationConstraint();
    fooAConstraint.addChild(studyAConstraint);
    fooAConstraint.addChild(fooConstraint);
    fooAConstraint.textRepresentation = CrossTableService.brief(fooAConstraint);

    let barConcept = new Concept();
    barConcept.type = ConceptType.CATEGORICAL;
    barConcept.code = 'bar';
    barConcept.name = 'Bar';
    let barConstraint = new ConceptConstraint();
    barConstraint.concept = barConcept;
    barConstraint.textRepresentation = CrossTableService.brief(barConstraint);

    // Dummy result for two rows
    let testRows = [[5], [6]];

    // Prepare checks for the first call
    crossTableCall = spyOn(transmartResourceService, 'getCrossTable').and.callFake(
      (baseConstraint: Constraint, rowConstraints: Constraint[], columnConstraints: Constraint[]) => {
        let result = new TransmartCrossTable();
        result.rows = testRows;
        return Observable.of(result);
      });

    // Call the service
    crossTableService.rowConstraints.push(fooAConstraint);
    crossTableService.updateValueConstraints([fooAConstraint]);

    testRows = [[1, 2], [3, 4]];

    crossTableService.columnConstraints.push(barConstraint);
    crossTableService.updateValueConstraints([barConstraint]);

    let columnHeaders = crossTableService.cols.map(col => col.header);
    expect(columnHeaders).toEqual([' - ', ' - ', ' - ']);

    let rows = crossTableService.rows.map(row =>
      crossTableService.cols.map(col => row.data[col.field].value));
    expect(rows).toEqual([
      ['', 'A', 'B'],
      ['one', 1, 2],
      ['two', 3, 4]
    ]);

    expect(crossTableService.rowConstraints.map(constraint => constraint.textRepresentation)).toEqual(
      ['Foo']
    );

    expect(crossTableService.columnConstraints.map(constraint => constraint.textRepresentation)).toEqual(
      ['Bar']
    );
  });

});
