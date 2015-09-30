# Thaumaturgy
Build Node.js packages in AWS Lambda using AWS Lambda.

You can use Node packages in AWS Lambda, but they have to be built for that environment.  Instead of spinning up an EC2 instance, 
you can use Thaumaturgy to build Node packages for AWS Lambda - in AWS Lambda!

## Installation
Install Thaumaturgy globally using npm.

`npm install thaumaturgy -g`

You'll also need a Role in AWS IAM that has the minimum permissions listed below, in the Permissions section.

## Configure
The configure command will store settings in a `.thaumaturgy` folder in your home directory.

`thaumaturgy configure`

You'll be prompted for your:
- AWS Access Key
- AWS Secret Access Key
- Role ARN
- S3 Bucket (to store results)
- NPM Version (2 or 3, the output is different)

## Deploy
The deploy command will build the Thaumaturgy Lambda zip file and deploy it to AWS Lambda.

`thaumaturgy deploy`

## Build
Now you're ready to have Thaumaturgy build Node packages for you!  You can pass in a list of packages, or tell it to read a package.json file.
When the build is complete, Thaumaturgy stores the results in s3. However, you can tell it to automatically download it for you.

Examples:  
Build one package -  
`thaumaturgy build mkdirp:^0.5.1` 

Build multiple packages -  
`thaumaturgy build mysql2:0.15.8 mongodb:~2.0.45`  

Build a package and download it when complete -  
`thaumaturgy build redis:latest --download /tmp/redis.zip`

Build all `dependencies` in a package.json -  
`thaumaturgy build --file package.json`  

## Permissions
You Role will need the following permissions. These permissions let the Thaumaturgy Lambda store logs in AWS Cloud Watch
and store build results in S3.

```js
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": [
        "arn:aws:s3:::*"
      ]
    }
  ]
}
```
It will also need a 'Trust Relationship' that lets AWS Lambda assume the Role:
```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```
## License (MIT)

```
WWWWWW||WWWWWW
 W W W||W W W
      ||
    ( OO )__________
     /  |           \
    /o o|    MIT     \
    \___/||_||__||_|| *
         || ||  || ||
        _||_|| _||_||
       (__|__|(__|__|
```

Copyright (c) John Titus <john.titus@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
