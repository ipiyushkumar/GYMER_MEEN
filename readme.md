# Project Feedbacker
this is a project to provide a feedback application to an authority running over an education institution

### Installtion and run
1. download repo
```code
git clone URL
cd URL
```
2. Install Dependencies
```code
npm i
``` 
3. Setup .env
4. start server
```code
npm run start
```
### Application Dependencies

### .env Structure
```code
MongoDB_URL=
PORT=
Secret_KEY=
```
## General Schema
### user
> name 
> email
> password
> enroll
> phone
> role 
> education
> department
> sem
> gender
> dob

### Login
>Email : Unique
>Password : Unique

### Feedback
>Student
>department
>sem
>course
>Feedback : [question, answer]
>TImeStamp

### Course
>Course name
>sem
>department
>teacher

### Department
>name
>hod

### Questions
>question

### SEM
> name 
> department
> enabled