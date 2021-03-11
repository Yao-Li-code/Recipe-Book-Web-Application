import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { AuthInceptorService } from "./auth/auth.interceptors.service";
import { RecipeService } from "./recipes/recipe.service";
import { ShoppingListService } from "./shopping-list/shopping-list.service";


@NgModule({
    providers:[
        ShoppingListService, 
        RecipeService,
        {provide:HTTP_INTERCEPTORS,
        useClass:AuthInceptorService, 
        multi:true},
    ]
})

export class CoreModule{

}