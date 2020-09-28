/**
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {ModuleWithProviders} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import { GbSurvivalResultsComponent } from './gb-survival-results.component';



// Route Configuration
const routes : Routes =[
    {
        path:'',
        component: GbSurvivalResultsComponent
    }
]

export const routing: ModuleWithProviders = RouterModule.forChild(routes);