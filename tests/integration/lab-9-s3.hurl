# tests/integration/lab-9-s3.hurl
# Integration test for AWS S3-based fragment storage

# 1. Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:Ferozali1
`Hello S3!`

# Expect a 201 response and valid fragment structure
HTTP/1.1 201
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "text/plain"
jsonpath "$.fragment.size" == 9
jsonpath "$.fragment.id" matches "^[0-9a-fA-F-]+$"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"

[Captures]
url: header "Location"

# 2. GET the same fragment from the Location URL
GET {{url}}
[BasicAuth]
user1@email.com:Ferozali1

HTTP/1.1 200
Content-Type: text/plain
Content-Length: 9
[Asserts]
body == "Hello S3!"

# 3. DELETE the fragment
DELETE {{url}}
[BasicAuth]
user1@email.com:Ferozali1

HTTP/1.1 200

# 4. Try GET again – should now return 404
GET {{url}}
[BasicAuth]
user1@email.com:Ferozali1

HTTP/1.1 404
