import { Component, type OnInit } from "@angular/core"
import { FormBuilder, type FormGroup, Validators, ReactiveFormsModule } from "@angular/forms"
import  { Router } from "@angular/router"
import { CommonModule } from "@angular/common"
import {AuthService} from "../../services/auth.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup
  loading = false
  submitted = false
  errorMessage = ""


  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ["", Validators.required],
      password: ["", Validators.required],
    })
  }

  get f() {
    return this.loginForm.controls
  }

  onSubmit() {
    this.submitted = true
    this.errorMessage = ""

    if (this.loginForm.invalid) {
      return
    }

    this.loading = true

    this.authService.login(this.f["username"].value, this.f["password"].value).subscribe({
      next: () => {
        this.showNotification("success", "Login Successful", "Welcome back!")

        this.router.navigate(["/dashboard"])
      },
      error: (error) => {
        this.errorMessage = error.message || "Login failed. Please check your credentials."
        this.loading = false

        this.showNotification("error", "Login Failed", this.errorMessage)
      },
    })
  }

  private showNotification(type: "success" | "error", title: string, message: string) {
    console.log(`${type}: ${title} - ${message}`);
  }
}
