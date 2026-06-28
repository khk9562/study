---
title: "[Udemy] FastAPI101"
tags: ["FastAPI"]
date: 2024-06-11
notion_id: e81da5da-155d-49a9-9022-6709dbf962dc
notion_last_edited: 2026-06-28T08:31:00.000Z
synced_at: 2026-06-28
---
> 📅 **학습일**: 2024-06-11

`240612 수`


## 6. What is an API?


    ## What is an Interface?

    - A car’s interface are the steering wheel, the pedals, and the knobs in the dashboard
        - The interface between car and driver
    - A restaurant’s server (waiter) may be thought of as the interface between customer and chef
    - What about a code interface?
    **[db.py]**

        ```python
        _db = {}
        
        def add_post(title, body):
            _db[title] = body
        
        def find_post(title):
            return _db[title]
        ```

        - The inteface to the database consists of the two functions.

        **[app.py]**


        ```python
        from db import add_post, find_post
        
        add_post("Hello", "Hello, world!")
        
        print(find_post("Hello"))
        ```


    ## What is a web API?

    - Just like the code file, but instead of  one code file asking another file to do something(by running a function), one program asks another program over the internet
    - This is done by the client sending a request

        `GET` `/post/Hello`
        Method Endpoint


    ## What is in a request?

    - A few pieces of data, which are interpreted by the server however it wishes
        - Although there are some standards…

    ### HTTP Request

    - `Method`
        - GET
        - POST
        - PUT
        - DELETE
        - PATCH
        - Others…
    - `Endpoint`
        - /post
        - ?sorting=new
    - `Body`
        - usually JSON
    - `Headers`
        - Extra information in key-value pairs. Each key tends to have specific meaning.
        - Ex. Content-Type: application/json

    *(이미지 생략)*


    ### What is JSON?

    - Javascript Object Notation. It’s a language-agnostic wqy to share data.
    - Data is comprised of keys and values, like this:

        ```python
        {
        	"title": "Hello",
        	"body": "Hello, world!",
        	"user_id": 3,
        	"tags": ["news", "code"]
        }
        ```

    - Because it’s easy to convert to a string, we tend to use it to share data between client and server.

    ### But what’s REST?


## 7. What is REST?


    ## What are the REST constraints?

    - Should use the concepts of “client” and “server”
    - Should use the concept of “resource”
    - Should be stateless
    - Should be cacheable
    - Should have a uniform, hypermedia-driven interface
    - If the backend uses multiple servers, this should be invisible to client

    ## What is a resource?

    - “Thing” that the API deals in
        - Posts, comments, likes, users, etc.
    - When the client makes a request, it’s a request about a particular resource
        - E.g. give me the post with ID 3
    - When the server responds to a request, it does so with a resource representation
        - E.g.

            ```python
            {
            	"id": 3,
            	"title": "post title here",
            	"body": "body of the post here",
            	"user_id": 3
            }
            ```


    ## What does stateless mean?

    - The server doesn’t keep any information about the clients
    - For example, let’s say the client wants to:
        - Get information about post with ID 3
        - Change the post’s title
    - THis should be two requests (one GET and one PATCH)
    - In both requests, the client must say what post it’s talking about
    - For the second request, the server can’t remember that the first request was about post 3

    ## What does cacheable mean?

    - If one client makes a request for information, it should be possible for the backend to save that response
    - So if another client makes a request for the same information, it doesn’t have to be recalculated

    ## What does hypermedia-driven mean?

    - If a resource is related to another resource, there should be an actual link in the response which allows the client to “find” the related resources.
    **Instead of this…**

        ```python
        {
        	"id": 123,
        	"title": "post title here",
        	"body": "body of the post here",
        	"user_id": 3
        }
        ```


        **Do this**


        ```python
        {
        	"id": 123,
        	"title": "post title here",
        	"body": "body of the post here",
        	"user_id": 3,
        	"user_link": "/user/3"
        }
        ```


    ## What does multiple servers mean?

    - Somtimes our backends are made up of multiple servers
    - For example, one server for posts and comments
    - Another for user authentication and registration
    - The client shouldn’t care about how the backend is organised!

## 10. Initial App Setup


    ### python3만 설치돼서 python 명령어 인식 안되는 문제

    - `brew install python`
    - `brew info python@3.12`
    - `sudo ln -sf $(brew --prefix)/opt/python@3.12/bin/python3 /usr/local/bin/python`

    ---

    - `brew install pyenv`
    - `pyenv local 3.11`
    - `pyenv exec python -v`
    - `pyenv exec python -m venv .venv`
    - `source .venv/bin/activate`
    - **[requirements.txt]**

    ```python
    fastapi
    uvicorn[standard]
    ```

    - `pip install -r requirements.txt`
    - **[.gitignore]**

    ```python
    .DS_Store
    *.pyc
    __pycache__
    .env
    *.db
    .venv
    .vscode/
    *.png
    ```

    - **[requirements-dev.txt]**

    ```python
    ruff
    ```

    - `pip3 install -r requirements-dev.txt`
    - **VSCode Extension 에서 Ruff 설치**

        Ruff for Formatting, sorting imports, and linting.

        - cmd + ,
    - .vscode > [**settings.json]**

        ```json
        "[python]": {
            "editor.codeActionsOnSave": {
              "source.organizeImports": "explicit",
              "source.fixAll": "explicit"
            }
          },
          "editor.formatOnSave": true,
          "editor.defaultFormatter": "charliermarsh.ruff"
        ```


## **12. Our social media API: adding posts**


    **[main.py]**


    ```json
    from fastapi import FastAPI
    
    from storeapi.models.post import UserPost, UserPostIn
    
    app = FastAPI()
    
    
    post_table = {}
    
    
    @app.post("/post", response_model=UserPost)
    async def create_post(post: UserPostIn):
        data = post.dict()
        last_record_id = len(post_table)
        new_post = {**data, "id": last_record_id}
        post_table[last_record_id] = new_post
        return new_post
    
    
    @app.get("/post", response_model=list[UserPost])
    async def get_all_posts():
        return list(post_table.values())
    ```


    **[models/post.py]**


    ```json
    from pydantic import BaseModel
    
    
    class UserPostIn(BaseModel):
        body: str
    
    
    class UserPost(UserPostIn):
        id: int
    ```


    Postman 에서 api getlist, create 테스트 완


## 14. Adding Comments to the social media API : post 관련 api 구현

    1. What data does you API receive and return?
    2. What data do you need to store?
    3. Write the interface (aka the endpoints)

    ### How do we include that dynamic segment in the URL?

    - Get comments on post

        [http://<ip주소>:8000/post/0/comments](http://<ip주소>:8000/post/0/comments)


        이제 이 0이 post_id 값으로 다이나믹하게 들어가야하는데 어케 함?


## 16. Pytest


    for how that code could be used or how that function coud be called.


    So writing tests as you go along helps you put yourself in this mindset of what do I want this function to do given certain inputs and that moves you from an implementation mindset to a mathematical mindset. Inputs, outputs and what could potentially go wrong.


    # write a test that attempts to create a post, but it doesn't pass a "body" key in the JSON payload.


    ```json
    async def test_create_post_no_body(async_client: AsyncClient):
    	response = await async_client.post("/post", json={})
    	assert response.status_code == 422
    	assert response.json() == {
    		"detail": [
    			{
    				"loc": ["body"],
    				"msg": "field required",
    				"type": "value_error.missing"
    			}
    		]
    	}
    ```


`240613 목`


### 23. Creating a config file using Pydantic

    - Environment variables are variables whose value is set before you run your Python
    - `export DATABASE_URL=”sqlite:///data.db”`

    ```json
    import os
    
    print(os.getenv("DATABASE_URL"))
    ```


    ### Configuration files with Pydantic

    - Value not stored in the code
    - Great for storing secrets, so we can share the code

    `pip3 install -r requirements.txt`


    ```json
    fastapi
    uvicorn[standard]
    sqlalchemy
    databases[aiosqlite]
    python-dotenv
    pydantic-settings
    ```


    **[storeapi/config.py]**


    ```json
    from pydantic import BaseSettings
    
    
    class BaseConfig(BaseSettings):
        class Config:
            env_file: str = ".env"
    ```


    ### Changes to class Config

    - As of Pydantic v2, we dont’t use class Config anymore. Instead, we should use SetiingsConfigDict.
    - Also, Pydantic configuration management has moved to the pydantic_settings package.

    ### config 파일이란?

    - configuration(환경 설정)을 줄인 말
    - 프로그램의 매개 변수나 초기 설정 등을 구성하는 데 사용하는 파일
    - XML, JSON 로 저장되기도 함

    ### Type hinting inherited variables now mandatory

    - As of Pydantic v2, we must add type hints to inherited class variables, such as in our TestConfig.

        ```javascript
        class TestConfig(BaseConfig):
            DATABSE_URL: Optional[
        str
        ] = None
            DB_FORCE_ROLL_BACK: 
        bool
         = False
        
            class Config:
                env_prefix = "TEST_"
        ```


### database

    - 먼저 `storeapi` 폴더에 [`database.py`](http://database.py/) 생성

    ```json
    import databases
    import sqlalchemy
    from config import config
    
    metadata = sqlalchemy.MetaData()
    
    post_table = sqlalchemy.Table(
        "posts",
        metadata,
        sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
        sqlalchemy.Column("body", sqlalchemy.String),
    )
    
    comment_table = sqlalchemy.Table(
        "comments",
        metadata,
        sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
        sqlalchemy.Column("body", sqlalchemy.String),
        
    sqlalchemy.Column("post_id", sqlalchemy.ForeignKey("posts.id"), nullable=False)
    ,
    )
    
    engine = sqlalchemy.create_engine(
        config.DATABSE_URL, connect_args={"check_same_thread": False}
    )
    
    metadata.create_all(engine)
    database = databases.Database(
        config.DATABSE_URL, force_rollback=config.DB_FORCE_ROLL_BACK
    )
    ```


    **[.env]**


    ```json
    ENV_STATE=dev
    DATABASE_URL=sqlite:///data.db
    DEV_DATABASE_URL=sqlite:///data.db
    TEST_DATABASE_URL=sqlite:///test.db
    PROD_DATABASE_URL=sqlite:///prod.db
    TEST_DB_FORCE_ROLL_BACK = False
    ```


    **[config.py]**


    ```json
    from functools import lru_cache
    from typing import Optional
    
    from pydantic_settings import BaseSettings
    
    
    class BaseConfig(BaseSettings):
        ENV_STATE: Optional[str] = None
    
        class Config:
            env_file: str = ".env"
            extra = "allow"
    
    
    class GlobalConfig(BaseConfig):
        DATABASE_URL: Optional[str] = None
        DB_FORCE_ROLL_BACK: bool = False
    
    
    class DevConfig(GlobalConfig):
        class Config:
            env_prefix = "DEV_"
    
    
    class ProdConfig(GlobalConfig):
        class Config:
            env_prefix = "PROD_"
    
    
    class TestConfig(GlobalConfig):
        DATABASE_URL: Optional[str] = "sqlite:///test.db"
        DB_FORCE_ROLL_BACK: bool = True
    
        class Config:
            env_prefix = "TEST_"
    
    
    @lru_cache()
    def get_config(env_state: str):
        configs = {"dev": DevConfig, "prod": ProdConfig, "test": TestConfig}
        return configs[env_state]()
    
    
    config = get_config(BaseConfig().ENV_STATE)
    ```


    **[database.py]**


    ```json
    import databases
    import sqlalchemy
    
    from storeapi.config import config
    
    metadata = sqlalchemy.MetaData()
    
    post_table = sqlalchemy.Table(
        "posts",
        metadata,
        sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
        sqlalchemy.Column("body", sqlalchemy.String),
    )
    
    comment_table = sqlalchemy.Table(
        "comments",
        metadata,
        sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
        sqlalchemy.Column("body", sqlalchemy.String),
        sqlalchemy.Column("post_id", sqlalchemy.ForeignKey("posts.id"), nullable=False),
    )
    
    engine = sqlalchemy.create_engine(
        config.DATABASE_URL, connect_args={"check_same_thread": False}
    )
    
    metadata.create_all(engine)
    database = databases.Database(
        config.DATABASE_URL, force_rollback=config.DB_FORCE_ROLL_BACK
    )
    ```


### test

    - And therefore not the values that are in the .env file.
    Or, to put it differently, we need to override the value of env underscore state.

        ```json
        import os
        
        os.environ["ENV_STATE"] = "test”
        ```

    - Because when we import app, we import database, and when we import database we import config, and when we import config, we’re actually reading the values.
    → 그래서 import 순서가 아래와 같이?
    database를 import 하는 app을 import, config를 import하는 database를 import, value 값을 읽는 config를 import. 
    ??? 이게 왜 import 순서의 이유지
    아 값을 읽어오는 게 쭉 overwrite돼서 app에 전달되니까 환경변수를 test로 처리한 후에 읽는게 맞지

        ```json
        from storeapi.routers.post import comment_table, post_table
        
        os.environ["ENV_STATE"] = "test"
        
        from storeapi.main import app  # noqa: E402
        ```

        - It’s going to overwrite the value that is read from the .env file, and we’re going to use the test mode for our tests.
        - with the e402 rule, which tells us that imports should be at the top of the file, because we’ve got some non-import code before it, the Ruff linter consi                               ders
    - And then for every database interaction, it’s always the same thing.
        - First you decide what you want to do with the database.
        - Then you write a query for the database.
        - And finally you run the query.
    - insert
        - when we insert data into a table we need to give it what values we want to insert into each column.

`240614 금`


### 29


    ### Changes to class Config

    - Remember that we don’t use class Config anymore. To enable “ORM mode”, or access to attributes using dot notation, we must add a configuration dictionary with from_attributes=True.

        ```json
        from pydantic import ConfigDict
        
        class UserPost(UserPostIn):
            model_config: ConfigDict(from_attributes=True)
            id: int
        
            class config:
                orm_mode = True
        ```


### logging module


    loggers, handlers, formatters, filters, and how they work together…


    ## Loggers, handlers, and formatters

    - let’s talk about the logging module in Python.
    Three key concepts in the logging module are loggers, handlers, and formatters.
    - In the realm of code, logging’s a fickle dance, Too many logs may leave budgets askance. Find the balance, and debug you can, But log too much, you’ll end up in a jam!

    ### Pros / cons of logging

    - Lets you see what happened during a request
    요청 중에 발생한 일을 확인할 수 있습니다
    - Can make your code less readable
    코드를 덜 읽기 쉽게 만들 수 있습니다
    - Gain historical context into your application
    애플리케이션에 대한 과거 컨텍스트 획득
    - Need to pay for log storage
    로그 저장에 대한 비용을 지불해야 함
    - Once set up, logging is easy
    일단 설정하면 로깅이 쉽습니다
    - A bit confusing the first time you set it up
    처음 설정할 때 약간 혼란스럽습니다
    - Set up alerts and dashboards when certain logs happen
    특정 로그가 발생할 때 경고 및 대시보드 설정

    ### The logging module in Python: A quick primer

    - `Logger` : Schedules log information for output
    - `Handler` : Each one or more loggers have handler.
    Sends the log information to a destination.
    - `Formatter` : Each handler has one formatter attached to it that defines how that log information will be displayed.

    ### Logging level

    - You can log messages in different levels.

    | Level    | Meaning                                                                                                                            |
    | -------- | ---------------------------------------------------------------------------------------------------------------------------------- |
    | CRITICAL | Errors that cause application failure, such as a crucial database being unavailable.                                               |
    | ERROR    | Handling errors that affect the application’s operation, such as an HTTP 500 error, but allow the application to continue working. |
    | WARNING  | Non-critical issues that require attention, such as deprecated code usage or low disk space.                                       |
    | INFO     | Informative messages. This could be a user authentication message or version info.                                                 |
    | DEBUG    | Debugging messages, provides extra information for developers during development or testing.                                       |


    ```python
    import logging
    
    # 핸들러가 하나인 경우는 그냥 변수 핸들러로 처리
    # handler = logging.StreamHandler()
    # 핸들러가 두개인 경우
    console = logging.StreamHandler()
    file_handler = logging.FileHandler("file.log")
    # logging.basicConfig(level=logging.DEBUG, handlers=[handler])
    logging.basicConfig(level=logging.DEBUG, handlers=[console, file_handler])
    
    logger = logging.getLogger('myLogger')
    
    logger.debug('This message is a debug message')
    logger.info('This message is an informational message')
    logger.warning('This message is a warning')
    logger.error('This message is an error message')
    logger.critical('This message is a critical message')
    ```

    - `%(levelname)s``:``%(name)s``:``%(message)s`

        DEBUG:myLogger:This message is a debug message


        ```python
        import logging
        
        console = logging.StreamHandler()
        file = logging.FileHandler("file.log")
        logging.basicConfig(
        	level=logging.DEBUG,
        	format="%(asctime)s %(levelname)s %(name)s:%(lineno)d %(message)s"
        	handlers=[console, file]
        )
        
        logger = logging.getLogger("myLogger")
        
        logger.debug("This message is a debug message")
        logger.info("This message is an informational message")
        ```


        → 2023-03-06 17:00:11,096 DEBUG myLogger:13 This message is a debug message
        → 2023-03-06 17:00:11,097 INFO myLogger:14 This message is an informational message


    ### logging.basicConfig: A blessing or a curse?

    - logging.basicConfig gives us some nice defaults
    - But using it means we don’t have as much control
    - Instead, it’s better to set up our logger manually
    - We’ll create our logger, handlers, and formatter
    - Then we’ll set each handler’s formatter and add the handlers to the logger

    ```python
    import logging
    
    # Get the logger and set its level
    logger = logging.getLogger("myLogger")
    logger.setLevel(logging.DEBUG)
    
    # Create the handlers
    console = logging.StreamHandler()
    file_handler = logging.FileHandler("file.log")
    
    # Create the formatter
    formatter = logging.Formatter(
    	"%(asctime)s %(levelname)s %(name)s:%(lineno)d %(message)s"
    )
    
    # Add the formatter to the handlers
    console.setFormatter(formatter)
    file_handler.setFormatter(formatter)
    
    # Add the handler to ther loggers
    logger.addHandler(console)
    logger.addHandler(file_handler)
    
    # Actually use the logger
    logger.debug("debug message")
    logger.info("info message")
    ```


### Loggers **hierarchies and __**name__

    - let’s talk about the Python dunder name variable, and how we can use it for logger inheritance.

    ### What is __**name__**?: Special variable in Python

    - The value of __name__ is either “__main__” or the import path to the file
    - If you run the file as a script, then _name_ is “_main_”
    - Otherwise it’s the import path
    - Examples

    ### Logger inheritance

    - If we define a logger called storeapi (with handlers and formatters)
    - Then other loggers with specific names will use the ame handlers and formatters
    - Which names?
        - storeapi.routers.post
        - storeapi.security
        - storeapi.main

        **The** **`.`** **seperates inheritace levels
        Anything under** **`storeapi.*`** **will use the storeapi logger configuration**


### What are filters in the logging module?


    *(이미지 생략)*


    [https://docs.python.org/3/howto/logging.html#logging-flow](https://docs.python.org/3/howto/logging.html#logging-flow)


    *(이미지 생략)*


### **Logging HTTPExceptions with an Exception Handler**


    ```python
    @router.post("/comment", response_model=Comment, status_code=201, tags=["posts"])
    async def create_comment(comment: CommentIn):
        logger.info("Creating comment")
    
        post = await find_post(comment.post_id)
        if not post:
            logger.error(f"Post with id {comment.post_id} not found")
            raise HTTPException(status_code=404, detail="Post not found")
    ```


    아래로 대체


    ```python
    from fastapi.exception_handlers import http_exception_handler
    
    ...생략...
    
    @app.exception_handler(HTTPException)
    async def http_exception_handle_logging(request, exc):
        logger.error(f"HTTPException: {exc.status_code} {exc.detail}")
        return await http_exception_handler(request, exc)
    ```


### **Identifying logs from the same request: Correlation ID**


    **[requirements.txt]**


    ```python
    #추가
    asgi-correlation-id
    ```


    `pip3 install -r requirements.txt`


    **[main.py]**


    ```python
    #추가
    from asgi_correlation_id import CorrelationIdMiddleware
    
    app.add_middleware(CorrelationIdMiddleware)
    ```


### Adding JSON-formatted logs file 


    INFO:     Waiting for application startup.


    
2024-06-14T14:57:21 INFO     (-) uvicorn.error:62 - Application startup complete.   [on.py:62](http://on.py:62/)


    
2024-06-14T14:58:36 INFO     (59f8f731) storeapi.routers.post:45 - Getting all    [post.py:45](http://post.py:45/)


    **→ 이렇게 출력되는 로그 내용을 JSON 형식으로 바꾸기**

    - `requiremenets.txt`에 `python-json-logger` 추가 후,
    `pip3 install -r requirements.txt`
    - `logging_conf.py`에서

    ```python
    "file": {
    #    "class": "logging.Formatter",
    # 여기 수정
    		"class": "pythonjsonlogger.jsonlogger.JsonFormatter,
        "datefmt": "%Y-%m-%dT%H:%M:%S",
    # 여기 관련 구분 형식 다 빼고 수정
    #    "format": "%(asctime)s.%(msecs)03dZ | %(levelname)-8s |[%(correlation_id)s] %(name)s:%(lineno)d - %(message)s",
          "format": "%(asctime)s %(msecs)03d %(levelname)-8s %(correlation_id)s %(name)s %(lineno)d  %(message)s",
    },
    ```


### **Obfuscating email addresses in logs using a custom filter
사용자 정의 필터를 사용하여 로그의 전자 메일 주소 난독화**


    **[logging_conf.py]**


    ```python
    def obfuscated(email: str, obfuscated_length: int) -> str:
        characters = email[:obfuscated_length]
        first, last = email.split("@")
        return characters + ("*" * (len(first) - obfuscated_length)) + "@" + last
    
    
    # 사용자 정의 필터를 사용하여 로그의 전자 메일 주소 난독화
    class EmailObfuscationFilter(logging.Filter):
        def __init__(self, name: str = "", obfuscated_length: int = 4) -> None:
            super().__init__(name)
            self.obfuscated_length = obfuscated_length
    
        def filter(self, record: logging.LogRecord) -> bool:
            if "email" in record.__dict__:
                record.email = obfuscated(record.email, self.obfuscated_length)
            return True
    
    
    def configure_logging() -> None:
        dictConfig(
            {
                "version": 1,
                "disable_existing_loggers": False,
                "filters": {
                    "correlation_id": {
                        "()": "asgi_correlation_id.CorrelationIdFilter",
                        "uuid_length": 8 if isinstance(config, DevConfig) else 32,
                        "default_value": "-",
                        
    "obfuscated_length": 2 if isinstance(config, DevConfig) else 0,
                    },
                    "email_obfuscation": {"()": EmailObfuscationFilter},
    
                },
                "formatters": {
                    "console": {
                        "class": "logging.Formatter",
                        "datefmt": "%Y-%m-%dT%H:%M:%S",
                        "format": "(%(correlation_id)s) %(name)s:%(lineno)d - %(message)s",
                    },
                    "file": {
                        "class": "pythonjsonlogger.jsonlogger.JsonFormatter",
                        "datefmt": "%Y-%m-%dT%H:%M:%S",
                        "format": "%(asctime)s %(msecs)03d %(levelname)-8s %(correlation_id)s %(name)s %(lineno)d  %(message)s",
                    },
                },
                "handlers": {
                    "default": {
                        # "class": "logging.StreamHandler",
                        "class": "rich.logging.RichHandler",
                        "level": "DEBUG",
                        "formatter": "console",
                        "filters": ["correlation_id", "
    email_obfuscation
    "],
                    },
                    "rotating_file": {
                        "class": "logging.handlers.RotatingFileHandler",
                        "level": "DEBUG",
                        "formatter": "console",
                        "filename": "storeapi.log",
                        "maxBytes": 1024 * 1024,  # 1MB
                        "backupCount": 5,
                        "encoding": "utf8",
                        "filters": ["correlation_id"],
                    },
                },
    ```


### Generate the access token


    **[user.py]**


    ```python
    from storeapi.security import (
        authenticate_user,
        create_access_token,
        get_password_hash,
        get_user,
    )
    
    logger = logging.getLogger(__name__)
    
    # going to be used to get a JWT or access token or bearer token
    @router.post("/token")
    async def login(user: UserIn):
        user = await authenticate_user(user.email, user.password)
        access_token = create_access_token(user.email)
        return {"access_token": access_token, "token_type": "bearer"}
    ```


    **[test_user.py]**


    ```python
    @pytest.mark.anyio_backend
    async def test_login_user_not_exists(async_client: AsyncClient):
        response = await async_client.post(
            "/token", json={"email": "<email>", "password": "1234"}
        )
        assert response.status_code == 401
    ```


https://youtube.com/watch?v=0OYUTF5pWj8&si=kG-BDEJz93XEg7Bm
