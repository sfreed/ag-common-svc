import { Injectable } from '@angular/core';
import { addDoc, doc, getDoc, getFirestore, query, where, collection, getDocs, setDoc, 
  deleteDoc, orderBy, limit, QueryConstraint, Firestore } from "firebase/firestore"


  
@Injectable({
  providedIn: 'root'
})
export class CommonFireStoreDao<T> {
  public db: Firestore;
  
  constructor() { }

  public createWithId(value: T, uid: string, table: string): Promise<T> {
    const ref = doc(this.db, table, uid);

    const snap = setDoc(ref, value);

    return snap.then(ref => {
      return this.getById(table, uid)
    })
  }

  public create(value: T, table: string): Promise<T> {
    const ref = collection(this.db, table);

    const snap = addDoc(ref, value);
    
    return snap.then(ref => {
      return this.getById(table, ref.id)
    })
  }

  public createInSubcollection(value: T, table: string, record_id: string, subcollection: string): Promise<T> {
    const ref = collection(this.db, table, record_id, subcollection);

    const snap = addDoc(ref, value);

    return snap.then(ref => {
      return this.getById(table, ref.id)
    })

  }

  public async getAll(table: string, sortField?: string): Promise<T[]>{
    let records: T[] = []; 

    const ref = collection(this.db, table);

    const snap = await getDocs(ref);

    snap.forEach((doc) => {
      let data = doc.data();
      data.dbId = doc.id;
      records.push(data as T)
    });

    if(sortField){
      records = records.sort((a, b) => a[sortField] < b[sortField] ? -1 : a[sortField] > b[sortField] ? 1 : 0);
    }

    return Promise.resolve(records);
  }

  public async getAllFromSubCollection(table: string, record_id: string, subcollection: string): Promise<T[]>{
    let records: T[] = []; 

    const ref = collection(this.db, table, record_id, subcollection);

    const snap = await getDocs(ref);

    snap.forEach((doc) => {
      let data = doc.data();
      data.dbId = doc.id;
      records.push(data as T)
    });

    return Promise.resolve(records);
  }

  public async getAllOrderBy(table: string, order: string): Promise<T[]>{   
    let records: T[] = []; 

    const ref = collection(this.db, table);

    const q = query(ref, orderBy(order, "asc"));

    const snap = await getDocs(q);

    snap.forEach((doc) => {
      let data = doc.data();
      data.dbId = doc.id;
      records.push(data as T)
    });

    return Promise.resolve(records);

  }

  public async getMostRecentOrderBy(table: string, order: string): Promise<T[]>{
    let records: T[] = []; 

    const ref = collection(this.db, table);

    const q = query(ref, orderBy(order, "desc"), limit(1));

    const snap = await getDocs(q);

    snap.forEach((doc) => {
      let data = doc.data();
      data.dbId = doc.id;
      records.push(data as T)
    });

    return Promise.resolve(records);
  }

  public async getById(table: string, id: string): Promise<T> {
    const ref = doc(this.db, table, id);

    const snap = await getDoc(ref);

    let retval: T = snap.data() as T;
    
    if(retval){
      retval['dbId'] = snap.id;
    }
    
    return Promise.resolve(retval); 
  }

  public async getAllByValueOrderBy(table: string, field: string, value: string, operation: WhereFilterOp, order: string): Promise<T[]> {
    let records: T[] = []; 
    
    const ref = collection(this.db, table);

    const q = query(ref, orderBy(order, "asc"), where(field, operation, value));

    const snap = await getDocs(q);

    snap.forEach((doc) => {
      let data = doc.data();
      data.dbId = doc.id;
      records.push(data as T)
    });

    return Promise.resolve(records);
    
  }

  public delete(id: string, table: string): Promise<void>{
    const ref = doc(this.db, table, id);

    return deleteDoc(ref);
  }

  public update(value: T, id: string, table: string): Promise<void> {
    const ref = doc(this.db, table, id);

    const snap = setDoc(ref, value);

    return Promise.resolve(snap); 
  }

  public async getAllByQValue(table: string, queries: QueryParam[], sortField?: string): Promise<T[]> {
    let records: T[] = []; 
    
    const ref = collection(this.db, table);

    let restraints: QueryConstraint[] = []

    queries.forEach(q => { 
       restraints.push(where(q.field, q.operation, q.value));
    })

    const q = query(ref, ...restraints);
    
    const snap = await getDocs(q);

    snap.forEach((doc) => {
      let data = doc.data();
      data.dbId = doc.id;
      records.push(data as T)
    });

    if(sortField){
      records = records.sort((a, b) => a[sortField] < b[sortField] ? -1 : a[sortField] > b[sortField] ? 1 : 0);
    }

    return Promise.resolve(records);
  }

  public async getAllInSubCollectionByQValue(table: string, record_id: string, subcollection: string, queries: QueryParam[], sortField?: string): Promise<T[]> {
    let records: T[] = []; 
    
    const ref = collection(this.db, table, record_id, subcollection);

    let restraints: QueryConstraint[] = []

    queries.forEach(q => { 
       restraints.push(where(q.field, q.operation, q.value));
    })

    const q = query(ref, ...restraints);
    
    const snap = await getDocs(q);

    snap.forEach((doc) => {
      let data = doc.data();
      data.dbId = doc.id;
      records.push(data as T)
    });

    if(sortField){
      records = records.sort((a, b) => a[sortField] < b[sortField] ? -1 : a[sortField] > b[sortField] ? 1 : 0);
    }

    return Promise.resolve(records);
  }

  public updateInSubcollection(value: T, table: string, record_id: string, subcollection: string, id: string): Promise<T> {
    const ref = doc(this.db, table, record_id, subcollection,id);

    const snap = setDoc(ref, value);

    return snap.then(ref => {
      return this.getById(table, id)
    })
  }

  public deleteFromSubcollection(table: string, record_id: string, subcollection: string, id: string): Promise<void> {
    const ref = doc(this.db, table, record_id, subcollection,id);

    return deleteDoc(ref);
  }
}

export class QueryParam{
  constructor(field: string, operation: WhereFilterOp, value: any){
    this.field = field;
    this.operation = operation;
    this.value = value;
  }
  field: string; 
  value: any;
  operation: WhereFilterOp;
}

export type WhereFilterOp =
| '<'
| '<='
| '=='
| '!='
| '>='
| '>'
| 'array-contains'
| 'in'
| 'array-contains-any'
| 'not-in';

