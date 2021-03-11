import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { DataStorageService } from '../shared/data-storage.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit, OnDestroy {
  usersub:Subscription
  isAuthenticated=false;

  constructor(private datastorage:DataStorageService,private authService:AuthService
  ){}

  ngOnInit(){
    this.usersub=this.authService.user.subscribe(user=>{
     this.isAuthenticated=!user? false:true
    })
  }

  onSaveData(){

    this.datastorage.storeRecipes()

  }

  onFeatechData(){
    this.datastorage.fetchRecipes().subscribe()
  }

  onLogout(){
    this.authService.logout()
  }

  ngOnDestroy(){
    this.usersub.unsubscribe()

  }


}
