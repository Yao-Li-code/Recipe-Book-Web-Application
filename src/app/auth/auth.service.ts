import { HttpClient, HttpErrorResponse } from "@angular/common/http";

import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject,  throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { User } from "./user.model";
import {environment} from '../../environments/environment'

 export interface AuthResponseData{
    idToken:string,
    email:string,
    refreshToken:string,
    expiresIn:string,
    localId:string,
    registered?: boolean

}

@Injectable({providedIn:'root'})

export class AuthService {

    tokenExpirationTimer:any

    user=new BehaviorSubject<User>(null)

    constructor( private http:HttpClient,private router:Router
    ){}

    private errorHandle(errorRes:HttpErrorResponse){
        let errorMessage="An unknown error occured!"
                if (!errorRes.error || !errorRes.error.error){
                    return throwError(errorMessage)
                } else{
                    switch(errorRes.error.error.message){
                        case "EMAIL_EXISTS":
                            errorMessage="This email already exists";
                            break;
                        case "EMAIL_NOT_FOUND":
                            errorMessage="This email doesn't exist";
                            break;
                        case "INVALID_PASSWORD":
                            errorMessage="This password is not correct";
                            break;
                        
        
    
    
                    }
                    return throwError(errorMessage)

    }}

    private authentificationHandler(email:string,userId:string,token:string,expiresIn:number){
        const expierationDate=new Date(new Date().getTime()+ +expiresIn*1000)
        const user=new User(
            email,
            userId,
            token,
            expierationDate);
            this.user.next(user)
            this.autoLogout(expiresIn*1000)
            localStorage.setItem('userData',JSON.stringify(user))

    }


    autoLogin() {
        const userData: {
          email: string;
          id: string;
          _token: string;
          _tokenExpire: string;
        } = JSON.parse(localStorage.getItem('userData'));
        if (!userData) {
          return;
        }

        const loadedUser= new User (
            userData.email,
          userData.id,
          userData._token,
          new Date(userData._tokenExpire)


        )
    
    
        if (loadedUser.token) {
          this.user.next(loadedUser);
          const expirationDuration =
            new Date(userData._tokenExpire).getTime() -
            new Date().getTime();
          this.autoLogout(expirationDuration);
        }
      }


    signup(email:string,password:string){
        return this.http.post<AuthResponseData>(
            'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key='+environment.firebaseAPIKey,
            {
                email:email,
                password:password,
                returnSecureToken:true

            }).pipe(catchError(this.errorHandle),tap(resData=>{
                this.authentificationHandler(resData.email,resData.localId,resData.idToken,+resData.expiresIn
                    )
            
            })
            )}

    login(email:string,password:string){
        return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key='+environment.firebaseAPIKey,
        {
            email:email,
            password:password,
            returnSecureToken:true

        }).pipe(catchError(this.errorHandle),
        tap(resData=>{
            this.authentificationHandler(resData.email,resData.localId,resData.idToken,+resData.expiresIn
                )
        
        }))}


        logout(){
            this.user.next(null)
            this.router.navigate(['/auth'])
            localStorage.removeItem('userData');
            if (this.tokenExpirationTimer){
                clearTimeout(this.tokenExpirationTimer)
            }
            this.tokenExpirationTimer=null;


        }

        autoLogout(expirationDuration:number){
            
            this.tokenExpirationTimer=
            setTimeout(()=>{
                this.logout()
            },expirationDuration)
        }
    

}