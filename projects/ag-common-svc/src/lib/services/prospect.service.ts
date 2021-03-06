import { Injectable } from '@angular/core';
import { Prospect } from 'ag-common-lib';
import { CommonFireStoreDao } from '../dao/CommonFireStoreDao.dao';


import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class ProspectService extends DataService<Prospect> {
  constructor() {
    super();
    super.collection = "prospects"
  }

  initialize(fsDao: CommonFireStoreDao<Prospect>){
    super.fsDao = fsDao;
  }
}
