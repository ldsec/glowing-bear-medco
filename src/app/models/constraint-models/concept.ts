/**
 * Copyright 2017 - 2018  The Hyve B.V.
 * Copyright 2020 - 2021 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Aggregate} from '../aggregate-models/aggregate';
import {ValueType} from './value-type';
import {MedcoEncryptionDescriptor} from '../tree-models/medco-encryption-descriptor';
import {Modifier} from './modifier';

export class Concept {
  private _path: string;
  private _type: ValueType;
  // the display text
  private _label: string;
  private _aggregate: Aggregate;
  private _code: string;
  private _name: string;
  private _fullName: string;
  private _comment: string;

  private _encryptionDescriptor?: MedcoEncryptionDescriptor;
  private _modifier?: Modifier;
  private _unit?: string;
  private _isInteger?: boolean;
  private _isPositive?: boolean;
  private _isText?: boolean;


  constructor() {
  }

  clone(): Concept {
    let ret = new Concept()

    ret.path = this.path
    ret.type = this.type
    ret.label = this.label
    ret.aggregate = (this.aggregate) ? this.aggregate.clone() : null
    ret.code = this.code
    ret.name = this.name
    ret.fullName = this.fullName
    if (this.encryptionDescriptor) {
      ret.encryptionDescriptor = this.encryptionDescriptor
    }
    if (this.unit) {
      ret.unit = this.unit
    }

    if (this.isInteger) {
      ret.isInteger = this.isInteger
    }

    if (this.isPositive) {
      ret.isPositive = this.isPositive
    }

    if (this._modifier) {
      ret._modifier = new Modifier(this._modifier.path, this._modifier.appliedPath, this._modifier.appliedConceptPath)
    }

    return ret
  }

  get path(): string {
    return this._path;
  }

  set path(value: string) {
    this._path = value;
  }

  get type(): ValueType {
    return this._type;
  }

  set type(value: ValueType) {
    this._type = value;
  }

  get aggregate(): Aggregate {
    return this._aggregate;
  }

  set aggregate(value: Aggregate) {
    this._aggregate = value;
  }

  get label(): string {
    return this._label;
  }

  set label(value: string) {
    this._label = value;
  }

  get code(): string {
    return this._code;
  }

  set code(value: string) {
    this._code = value;
  }

  get comment(): string {
    return this._comment;
  }
  set comment(value: string) {
    this._comment = value;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  get fullName(): string {
    return this._fullName;
  }

  set fullName(value: string) {
    this._fullName = value;
  }

  get encryptionDescriptor(): MedcoEncryptionDescriptor {
    return this._encryptionDescriptor;
  }

  set encryptionDescriptor(value: MedcoEncryptionDescriptor) {
    this._encryptionDescriptor = value;
  }

  get modifier(): Modifier {
    return this._modifier;
  }

  set modifier(mod: Modifier) {
    this._modifier = mod
  }

  get unit(): string {
    return this._unit;
  }

  set unit(val: string) {
    this._unit = val;
  }

  get isInteger(): boolean {
    return this._isInteger
  }

  set isInteger(val: boolean) {
    this._isInteger = val
  }

  get isPositive(): boolean {
    return this._isPositive
  }

  set isPositive(val: boolean) {
    this._isPositive = val
  }

  set isText(val: boolean) {
    this._isText = val
  }

  get isText(): boolean {
    return this._isText
  }
}
