# EduCopilot Backend — Person A: Authentication & User Management

## What's in this project

```
src/main/java/com/educopilot/backend/
├── EducopilotBackendApplication.java   # main class
├── model/
│   ├── User.java                       # entity → "users" table
│   └── Role.java                       # STUDENT / PROFESSOR / ADMIN
├── repository/
│   └── UserRepository.java             # DB access for User
├── dto/
│   ├── RegisterRequest.java
│   ├── LoginRequest.java
│   └── AuthResponse.java
├── controller/
│   ├── AuthController.java             # /api/auth/register, /api/auth/login
│   └── ProfileController.java          # example protected endpoints
└── security/
    ├── JwtUtil.java                    # create & validate tokens
    ├── JwtFilter.java                  # checks token on every request
    ├── CustomUserDetailsService.java   # loads user from DB for Spring Security
    └── SecurityConfig.java             # wires it all together, defines public vs protected routes
```

---

## Step 1 — Install prerequisites

- **Java 17** (JDK)
- **Maven** (or use the included `mvnw` if you add one)
- **PostgreSQL** running locally, with a database created:
  ```sql
  CREATE DATABASE educopilot;
  ```
- **IntelliJ IDEA** (Community edition is fine) or VS Code with the Java extension pack
- **Postman** for testing endpoints
- **Git** + a GitHub account

## Step 2 — Configure the database connection

Open `src/main/resources/application.properties` and update:
```properties
spring.datasource.username=postgres
spring.datasource.password=your_postgres_password
```
Also replace `jwt.secret` with your own random string — you can generate one with:
```bash
openssl rand -base64 32
```

## Step 3 — Run the project

**From IntelliJ:** open the folder, let Maven download dependencies, then run `EducopilotBackendApplication.java`.

**From terminal:**
```bash
mvn spring-boot:run
```

If it starts successfully, you'll see Spring Boot's banner and `Tomcat started on port(s): 8080`.
`spring.jpa.hibernate.ddl-auto=update` means Hibernate will auto-create the `users` table for you — no manual SQL needed for now.

## Step 4 — Test in Postman

**Register a student**
```
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "name": "person",
  "email": "person@example.com",
  "password": "password123",
  "role": "STUDENT"
}
```
Expected: `201 Created` with a JSON body containing a `token`.

**Register a professor** (repeat with `"role": "PROFESSOR"` and a different email)

**Login**
```
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "person@example.com",
  "password": "password123"
}
```
Expected: `200 OK` with a fresh `token`.

**Call a protected endpoint**
```
GET http://localhost:8080/api/me
Authorization: Bearer <paste the token here>
```
Expected: `200 OK` showing your email and role.

Without the `Authorization` header, this same request should return `401 Unauthorized` — that's the security working correctly.

**Test role restriction**
- Log in as a student, call `GET /api/professor/ping` → should return `403 Forbidden`.
- Log in as a professor, call the same endpoint → should return `200 OK`.

## Step 5 — What Person B needs from you

Once this is running, tell Person B (and the rest of the team):
1. The exact JSON shape of `User` (`id`, `name`, `email`, `role`) so their `Course.professor_id` foreign key lines up.
2. How to send the `Authorization: Bearer <token>` header so their endpoints can identify the logged-in user.
3. That any new controller they write is **protected by default** — `SecurityConfig` already requires a valid JWT on everything except `/api/auth/**`. They don't need to touch `SecurityConfig.java` themselves; they can just add `@PreAuthorize("hasRole('PROFESSOR')")` (see `ProfileController.java` for the pattern) on their own methods if they need role-specific access.

## Step 6 — Push to GitHub

```bash
git init                                   # only if this isn't already a git repo
git checkout -b feature/backend-auth
git add .
git commit -m "Add user auth: register, login, JWT, role-based security"
git push origin feature/backend-auth
```
Then open a Pull Request into `develop` so Person B (and the team) can review before merging.

## Common issues

| Problem | Likely cause |
|---|---|
| `401` on every request including register/login | `SecurityConfig` isn't permitting `/api/auth/**` — check the `requestMatchers` line |
| App won't start, "connection refused" to DB | PostgreSQL isn't running, or wrong username/password in `application.properties` |
| `403` even on your own role | `@PreAuthorize` role string mismatch — Spring Security expects `hasRole('PROFESSOR')` to match an authority of `ROLE_PROFESSOR`, which `CustomUserDetailsService` already adds the `ROLE_` prefix for |
| Token "invalid signature" | `jwt.secret` was changed after a token was issued — just log in again to get a fresh token |
