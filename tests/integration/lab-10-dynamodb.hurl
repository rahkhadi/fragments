# tests/integration/lab-10-dynamodb.hurl
# ✅ Integration test for AWS DynamoDB-based fragment metadata storage

# 1. POST a new fragment (text/plain)
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:Ferozali1
`Hello DynamoDB!`

HTTP/1.1 201
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "text/plain"
jsonpath "$.fragment.size" == 15
jsonpath "$.fragment.id" matches "^[0-9a-fA-F-]+$"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"

[Captures]
fragment_url: header "Location"
fragment_id: jsonpath "$.fragment.id"

# 2. GET the fragment from its Location
GET {{fragment_url}}
[BasicAuth]
user1@email.com:Ferozali1

HTTP/1.1 200
Content-Type: text/plain
Content-Length: 15
[Asserts]
body == "Hello DynamoDB!"

# 3. DELETE the fragment
DELETE {{fragment_url}}
[BasicAuth]
user1@email.com:Ferozali1

HTTP/1.1 200

# 4. Confirm fragment is gone
GET {{fragment_url}}
[BasicAuth]
user1@email.com:Ferozali1

HTTP/1.1 404

# 5. Confirm fragment ID is no longer in list
GET http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:Ferozali1

HTTP/1.1 200
[Asserts]
jsonpath "$.fragments" not contains "{{fragment_id}}"
