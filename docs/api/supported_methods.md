# HTTP Methods

## List of HTTP Methods

- **GET** – Retrieve data from the server.  
  Example: 
  ```http
    GET /users/123
  ```
  → Fetch user with ID 123.  

- **POST** – Create a new resource.  
  Example:  
  ```http
    POST /users
    Content-Type: application/json

    { "name": "Alice", "email": "alice@example.com" }
  ```
  → Creates a new user.  

- **PUT** – Replace an existing resource entirely.  
  Example:  
  ```http
    PUT /users/123
    Content-Type: application/json

    { "name": "Alice Smith", "email": "alice.smith@example.com" }
  ```
  → Updates user 123 with new data.  

- **PATCH** – Update part of an existing resource.  
  Example:  
  ```http
    PATCH /users/123
    Content-Type: application/json

    { "email": "newalice@example.com" }
  ```
  → Updates only the email of user 123.  

- **DELETE** – Remove a resource.  
  Example: 
  ```http
    DELETE /users/123
  ``` 
  → Deletes user 123.  

- **HEAD** – Retrieve headers only (no body).  
  Example: 
  ```http
    HEAD /users/123
  ```
  → Check if user 123 exists.  

- **OPTIONS** – Discover supported methods for a resource.  
  Example: 
  ```http
  OPTIONS /users
  ```
  → Server responds with `GET, POST, PUT, DELETE`.  
