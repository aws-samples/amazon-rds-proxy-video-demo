# Amazon RDS Proxy Demo Code

This code accompanies the [Amazon RDS Proxy Demo video - EDIT THIS WHEN LINK IS AVAILABLE](https://www.youtube.com/user/AmazonWebServices).

## Files

* index.js - The Lambda function shown in the demo video. This Lambda provides the application logic for the API presented in the demo.

## Notes

* The Lambda function relies on the following environment variables to be defined:
	* database
	* user
	* proxyendpoint
	* port
	* region

* The code in the Lambda function does a query against a table named `contacts` in the database. It is expected the schema of this table has two columns as below:

```
email	varchar(255)
name	varchar(255)
```

## MySQL Client Installation

You will need to package the mysql2 client library with your Lambda function. First, install the mysql2 client:

```
npm install –save mysql2
```

and then package the directory as described in [AWS Lambda Deployment Package in Node.js](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-package.html).

## Acknowlegements

The MySQL client linked in this sample is the [mysql2 client](https://www.npmjs.com/package/mysql2).
