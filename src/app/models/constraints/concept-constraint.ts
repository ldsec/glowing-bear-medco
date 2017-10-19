import {Constraint} from './constraint';
import {Concept} from '../concept';
import {ValueConstraint} from './value-constraint';
import {TimeConstraint} from './time-constraint';
import {TrialVisitConstraint} from './trial-visit-constraint';

export class ConceptConstraint implements Constraint {
  private _concept: Concept;
  private _values: ValueConstraint[];

  // observation date range
  applyObsDateConstraint = false;
  obsDateConstraint: TimeConstraint = new TimeConstraint();

  // trial visit
  applyTrialVisitConstraint = false;
  trialVisitConstraint: TrialVisitConstraint = new TrialVisitConstraint();


  constructor() {
    this.values = [];
  }

  get concept(): Concept {
    return this._concept;
  }

  set concept(value: Concept) {
    this._concept = value;
  }

  get values(): ValueConstraint[] {
    return this._values;
  }

  set values(value: ValueConstraint[]) {
    this._values = value;
  }

  getClassName(): string {
    return 'ConceptConstraint';
  }

  toPatientQueryObject(): Object {
    // TODO: implement the 'subselection' wrapper on a normal query object
    return null;
  }

  toQueryObject(): Object {
    // When no concept is selected, we cannot create a query object (it should be ignored)
    if (!this._concept) {
      return null;
    }

    let args = [];
    args.push({
      type: 'concept',
      path: this._concept.path,
      valueType: this._concept.type
    });

    if (this.values.length > 0) {
      if (this._concept.type === 'NUMERIC') {
        // Add numerical values directly to the main constraint
        for (let value of this.values) {
          args.push({
            type: 'value',
            valueType: value.valueType,
            operator: value.operator,
            value: value.value
          });
        }
      }
      if (this._concept.type === 'CATEGORICAL') {
        // Wrap categorical values in an OR constraint
        args.push({
          type: 'or',
          args: this.values.map((value: ValueConstraint) => value.toQueryObject())
        });
      }
    }

    if (this.applyObsDateConstraint) {
      args.push(this.obsDateConstraint.toQueryObject());
    }

    if (this.applyTrialVisitConstraint) {
      args.push(this.trialVisitConstraint.toQueryObject());
    }

    return {
      type: 'and',
      args: args
    };
  }

  get textRepresentation(): string {
    if (this._concept) {
      return `Concept: ${this._concept.path}`;
    }
    return 'Concept';
  }

}