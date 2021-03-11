import { Component, ComponentFactoryResolver, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { AlertComponent } from '../shared/alert/alert.component';
import { PlaceHolderDirective } from '../shared/Placeholder/placeHolder.directive';

import { AuthService,AuthResponseData
 } from './auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit, OnDestroy {

  @ViewChild(PlaceHolderDirective) alert:PlaceHolderDirective

  isLogin=true;
  isLoading=false;
  error:string=null;
  private closeSub:Subscription

  constructor( private authService:AuthService,
    private router:Router,
    private componentFactoryResolver:ComponentFactoryResolver) { }

  ngOnInit(): void {
  }

  onSwitch(){
    this.isLogin=!this.isLogin

  }

  onSubmit(form:NgForm){
    if (!form.valid){
      return ;
    }


    const email=form.value.email
    const password=form.value.password
    this.isLoading=true
    let authObs:Observable<AuthResponseData>

    if (this.isLogin){
      authObs=this.authService.login(email,password)
      

    } else{
    authObs=this.authService.signup(email,password)

    }

    authObs.subscribe(responseData=>{
      console.log(responseData)
      this.isLoading=false;
      this.router.navigate(['/recipes'])

    },errorMessage=>{
      console.log(errorMessage)
      this.error=errorMessage
      this.showErrorMessage(errorMessage)
      this.isLoading=false;
    })

    

    form.reset()
    
  }

  ngOnDestroy(){
    if (this.closeSub){
      this.closeSub.unsubscribe()
    }
  }

  private showErrorMessage(message:string){
    const alertFactory=this.componentFactoryResolver.resolveComponentFactory(AlertComponent)
    const hostViewContainer=this.alert.viewContainerRef
    hostViewContainer.clear()

    const componentRef=hostViewContainer.createComponent(alertFactory)

    componentRef.instance.message=message
    this.closeSub=componentRef.instance.close.subscribe(()=>{

     this.closeSub.unsubscribe()
     hostViewContainer.clear()
    })

  }
  

}
