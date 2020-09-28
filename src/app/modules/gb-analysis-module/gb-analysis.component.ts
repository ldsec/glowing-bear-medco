/**
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-gb-analysis',
  templateUrl: './gb-analysis.component.html',
  styleUrls: ['./gb-analysis.component.css']
})
export class GbAnalysisComponent implements OnInit {

  constructor() { }

  draggingmode(event) {
    event.preventDefault()
  }

  ngOnInit() {
  }

}
