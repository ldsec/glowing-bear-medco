/// <reference lib='webworker' />

import { ExploreQuery } from 'app/models/query-models/explore-query';
import { Subject } from 'rxjs';


const q = new ExploreQuery('thatName')
let obs = new Subject<string>()
addEventListener('message', ({ data }) => {

  let response = `worker response to ${data}`;
  obs.subscribe(x => {
    response = response + ' ' + x
  })

  obs.next('that feature')
  postMessage(response + ' ' + q.name);
});
