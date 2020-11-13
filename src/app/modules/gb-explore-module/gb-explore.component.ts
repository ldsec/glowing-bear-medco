/**
 * Copyright 2017 - 2018  The Hyve B.V.
 * Copyright 2020  LDS EPFL
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, OnInit} from '@angular/core';
import {FormatHelper} from '../../utilities/format-helper';
import {QueryService} from '../../services/query.service';
import {ExploreQueryType} from '../../models/query-models/explore-query-type';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {ConstraintService} from '../../services/constraint.service';

@Component({
  selector: 'gb-explore',
  templateUrl: './gb-explore.component.html',
  styleUrls: ['./gb-explore.component.css']
})
export class GbExploreComponent implements OnInit {

  constructor(public queryService: QueryService,
              public constraintService: ConstraintService) {
  }

  ngOnInit() {
    if (typeof Worker !== 'undefined') {
      // Create a new
      const worker = new Worker('./gb-explore.worker', { type: 'module' });
      worker.onmessage = ({ data }) => {
        console.log(`page got message: ${data}`);
      };
      worker.postMessage('hello');
    } else {
      // Web Workers are not supported in this environment.
      // You should add a fallback so that your program still executes correctly.
    }
  }

  get globalCount(): Observable<string> {
    return this.queryService.queryResults.pipe(map((queryResults) =>
      queryResults ? FormatHelper.formatCountNumber(queryResults.globalCount) : '0'
    ));
  }

  execQuery(event) {
    event.stopPropagation();
    this.queryService.execQuery();
  }

  get queryType(): ExploreQueryType {
    return this.queryService.query.type;
  }

  set queryType(val: ExploreQueryType) {
    this.queryService.query.type = val;
    this.queryService.isDirty = true;
  }
}
