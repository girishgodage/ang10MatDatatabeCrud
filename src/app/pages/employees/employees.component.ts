import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpDataService } from 'src/app/services/http-data.service';
import * as _ from 'lodash';
import { Employee } from 'src/app/models/employee';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css']
})
export class EmployeesComponent implements OnInit {

  @ViewChild('employeeForm', { static: false })
  employeeForm: NgForm;

  employeeData: Employee;

  dataSource = new MatTableDataSource();
  displayedColumns: string[] = ['id', 'userId', 'jobTitleName', 'firstName','lastName','preferredFullName','employeeCode','region', 'phoneNumber','emailAddress','actions'];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  isEditMode = false;

  constructor(private httpDataService: HttpDataService) {
    this.employeeData = {} as Employee;
   }

  ngOnInit(): void {
    // Initializing Datatable pagination
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Fetch All Employees on Page load
    this.getAllEmployees();
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  
  getAllEmployees(){
    this.httpDataService.getList().subscribe((response: any) => {
      this.dataSource.data = response;
    });
  }

  editItem(element) {
    this.employeeData = _.cloneDeep(element);
    this.isEditMode = true;
  }

  cancelEdit() {
    this.isEditMode = false;
    this.employeeForm.resetForm();
  }

  deleteItem(id) {
    this.httpDataService.deleteItem(id).subscribe((response: any) => {

      // Approach #1 to update datatable data on local itself without fetching new data from server
      this.dataSource.data = this.dataSource.data.filter((o: Employee) => {
        return o.id !== id ? o : false;
      })

      console.log(this.dataSource.data);

      // Approach #2 to re-call getAllEmployees() to fetch updated data
      // this.getAllEmployees()
    });
  }

  addEmployee() {
    this.httpDataService.createItem(this.employeeData).subscribe((response: any) => {
      this.dataSource.data.push({ ...response })
      this.dataSource.data = this.dataSource.data.map(o => {
        return o;
      })
    });
  }

  updateEmployee() {
    this.httpDataService.updateItem(this.employeeData.id, this.employeeData).subscribe((response: any) => {

      // Approach #1 to update datatable data on local itself without fetching new data from server
      this.dataSource.data = this.dataSource.data.map((o: Employee) => {
        if (o.id === response.id) {
          o = response;
        }
        return o;
      })

      // Approach #2 to re-call getAllEmployees() to fetch updated data
      // this.getAllEmployees()

      this.cancelEdit()

    });
  }

  onSubmit() {
    if (this.employeeForm.form.valid) {
      if (this.isEditMode)
        this.updateEmployee()
      else
        this.addEmployee();
    } else {
      console.log('Enter valid data!');
    }
  }

}
