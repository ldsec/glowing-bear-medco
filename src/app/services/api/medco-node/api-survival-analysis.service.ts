/**
 * Copyright 2020 CHUV
 * Copyright 2021 EPFL LDS
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Injectable } from '@angular/core';
import { ApiEndpointService } from '../../api-endpoint.service';
import { MedcoNetworkService } from '../medco-network.service';

import { CryptoService } from '../../crypto.service';
import { Observable, forkJoin } from 'rxjs';
import { timeout } from 'rxjs/operators';
import {ApiSurvivalAnalysisResponse} from '../../../models/api-response-models/survival-analysis/survival-analysis-response';
import {ApiSurvivalAnalysis} from '../../../models/api-request-models/survival-analyis/api-survival-analysis';

@Injectable()
export class ApiSurvivalAnalysisService {

  /**
  * Query timeout: 10 minutes.
  */
  private static TIMEOUT_MS = 1000 * 60 * 10;

  constructor(private apiEndpointService: ApiEndpointService,
    private medcoNetworkService: MedcoNetworkService,
    private cryptoService: CryptoService) { }

  survivalAnalysisSingleNode(nodeUrl: string, apiSurvivalAnalysis: ApiSurvivalAnalysis): Observable<ApiSurvivalAnalysisResponse> {
    return this.apiEndpointService.postCall(
      '/node/analysis/survival/query',
      apiSurvivalAnalysis,
      nodeUrl
    )
  }


  survivalAnalysisAllNodes(apiSurvivalAnalysis: ApiSurvivalAnalysis): Observable<ApiSurvivalAnalysisResponse[]> {
    apiSurvivalAnalysis.userPublicKey = this.cryptoService.ephemeralPublicKey
    return forkJoin(this.medcoNetworkService.nodes.map(
      node => {
        return this.survivalAnalysisSingleNode(node.url, apiSurvivalAnalysis)
      }
    ))
      .pipe(timeout(ApiSurvivalAnalysisService.TIMEOUT_MS))
  }
}
