# webCV

WebCV is a reusable template for creating a professional blog & resume/CV using React and Django.

It is based on [Mark Winter's](https://hackernoon.com/@mark.winter) [HackerNoon](https://hackernoon.com) article:

## [Creating websites using React and Django REST Framework](https://hackernoon.com/creating-websites-using-react-and-django-rest-framework-b14c066087c7)

![code image](https://cdn-images-1.medium.com/max/2000/1*93A43jqOXZYUr0yFMkcnNw.png)

Lately at work our go to architecture for creating websites is to use a React frontend with a Django REST Framework (DRF) backend. The two are connected by API calls using axios in the frontend. Some Redux is used as well for storing global app state. This is our preferred method as it allows the frontend and backend to be completely decoupled. And as long as we define a list of endpoints and returned data to work with, the frontend and backend can be developed in parallel. This also allows us the option to easily create mobile apps for any of the projects in the future as they can just consume the backend API. On a side note, we’re currently looking at using React Native for future mobile app projects.

In the rest of this post, I’ll go through how to setup a React frontend and DRF backend project. Note I assume you’re already familiar with React, Redux, Django, DRF, npm etc. This isn’t a tutorial for them.

### The Backend

There isn’t much to do for the default backend outside of simply installing Django and DRF, and setting up the database. From the root of your project folder, create a virtualenv and install Django and DRF.

```bash
$ virtualenv env
$ source env/bin/activate
$ pip3 install django djangorestframework django-filter
$ pip3 freeze > requirements.txt
```

Now start a new Django project and Django app.

```bash
$ django-admin startproject backend
$ cd backend
$ django-admin startapp api
```

You should now setup your database and edit your project’s settings to use the database. Good documentation on how to do this for your particular DB can be found on [Django’s website](https://docs.djangoproject.com/en/1.11/topics/install/#get-your-database-running). Then you should configure DRF following the instructions on their website found [here](http://www.django-rest-framework.org/#installation).

> #### Oauth Notes
>
> For this project I went ahead and used the [Django OAuth Toolkit](https://django-oauth-toolkit.readthedocs.io/en/latest/rest-framework/getting_started.html) library. 

The next step you will most likely want to do is setup authentication in your API. If you wont require authentication (e.g. no user logins), you can skip this. My company’s React/Django template project currently uses plain token authentication as it’s the simplest to setup. I recommend this for those learning as well, but it’s not the best for production. These tokens never expire which poses quite a security risk if it’s ever leaked. Soon we’ll update the template project to use something like oauth, or expiring JWT tokens — as of yet it’s undecided. Documentation for configuring token authentication is [here](http://www.django-rest-framework.org/api-guide/authentication/#tokenauthentication).

Once token authentication is configured, you will want to create a `urls.py` in your app (if you haven’t already), and use DRF’s token auth view. This endpoint at `/auth` lets users POST their username and password and get their auth token as a response. In the frontend, this token will get stored in the Redux store for further API calls.

```python
# file: api/urls.py
from django.conf.urls import url
from rest_framework.authtoken import views as drf_views
urlpatterns = [
    url(r'^auth$', drf_views.obtain_auth_token, name='auth'),
]
```

And just to make sure it’s clear, your `backend/urls.py` file should now look like this

```python
# file: backend/urls.py
from django.conf.urls import url, include

urlpatterns = [
    url(r'^', include('api.urls', namespace='api', app_name='api')),
]
```

> #### Deviation from article
>
> Using Django OAuth Toolkit (DOT), I added the following to `backend/urls.py`:
>

```python
# file: backend/urls.py
...
urlpatterns = [
    ...
    url(r'^o/', include(
        'oauth2_provider.urls', namespace='oauth2_provider')),
]
```

> resume article text...
>


By doing this, we’re just making each app look after its own urls. Maybe in the future you will add more apps to the backend and it would get messy to add everything to `backend/urls.py`

You should now have a functioning backend DRF API with a single endpoint /auth that lets users get their auth token. Let’s setup a user and run the backend server for testing later.

```bash
$ python3 manage.py migrate
$ python3 manage.py createsuperuser
$ python3 manage.py runserver 0.0.0.0:8000
```

Remember to run migrate for the first time to create your database. Then we’ll create a user for whom we can get an auth token for. With the server now running, you can test your `/auth` endpoint works quickly using curl

```bash
$ curl -X POST -d "username=username&password=password" http://localhost:8000/auth
```

> #### For OAuth
>
> Register a local app at `http://localhost:8000/o/applications/`
> Settings: 
> - Name: **local**
> - Client Type: **confidential**
> - Authorization Grant Type: **Resource owner password-based**
>
> Save app, and note Client Id and Client Secret.
> Use a slightly different curl command to get the token from DOT:
> `curl -X POST -d "grant_type=password&username=<username>&password=<password" -u"<Client id>:<Client secret>" http://localhost:8000/o/token/

### The Frontend

For the frontend, we used Facebook’s create-react-app as the starting point. So the first thing to do is install it and create a new project using it in the root of your project folder. We also eject the configuration as we need more control, and everyone on our team is fine with using webpack etc.

```bash
$ npm install -g create-react-app
$ create-react-app frontend
$ cd frontend
$ npm run eject
```

Next we want to install some additional dependencies.

```bash
$ npm install --save-dev babel-preset-es2015 babel-preset-stage-3
$ npm install --save redux redux-logger redux-persist react-redux
$ npm install --save axios react-router-dom lodash
```

Now instead of listing all the code used by our React template project, I’m just going to show the important parts that connect our frontend to our backend. Firstly create a redux store as we will want to save the user’s auth token for making more API calls in the future

```javascript
// file: src/store.js
import { compose, createStore, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';
import { persistStore, autoRehydrate } from 'redux-persist';
import rootReducer from './reducers';

const store = createStore(
  rootReducer,
  compose(
    applyMiddleware(
      createLogger(),
    ),
    autoRehydrate()
  )
);
persistStore(store);
export default store;
```

And then setup the token reducer

```javascript
// file: src/reducers/index.js
import { combineReducers } from 'redux';
import * as actionType from '../actions/types';

const tokenInitialState = null;
const token = (state = tokenInitialState, action) => {
  switch(action.type) {
    case actionType.SET_TOKEN:
      return action.data;
    default:
      return state;
  }
}

const appReducer = combineReducers({
  token,
})

const rootReducer = (state, action) => {
  return appReducer(state, action);
}

export default rootReducer;
```

And finally the actions

```javascript
// file: src/actions/index.js
import * as actionType from './types';

export const setToken = (data) => {
  return {
    type: actionType.SET_TOKEN,
    data
  }
}
```

```javascript
// file: src/actions/types.js
export const SET_TOKEN = "SET_TOKEN";
```

We now have an action we can dispatch to store the user’s token after logging in. So next lets look at how we login

```javascript
// file: src/util/Auth.js
import axios from 'axios';
import _ from 'lodash';
import store from '../store';
import { setToken } from '../actions'
import { URL, LOGIN } from '../config/Api';

export function InvalidCredentialsException(message) {
    this.message = message;
    this.name = 'InvalidCredentialsException';
}

export function login(username, password) {
  return axios
    .post(URL + LOGIN, {
      username,
      password
    })
    .then(function (response) {
      store.dispatch(setToken(response.data.token));
    })
    .catch(function (error) {
      // raise different exception if due to invalid credentials
      if (_.get(error, 'response.status') === 400) {
        throw new InvalidCredentialsException(error);
      }
      throw error;
    });
}

export function loggedIn() {
  return store.getState().token == null;
}
```

This piece of code uses axios to post to our `/auth` backend and then dispatch the returned token to our redux store. Once this is done, we can now create an axios based API client using our stored token to make further API calls from elsewhere in our React components.

```javascript
// file: src/util/ApiClient.js
import axios from 'axios';
import store from '../store';
import { URL } from '../config/Api';

export const apiClient = function() {
        const token = store.getState().token;
        const params = {
            baseURL: URL,
            headers: {'Authorization': 'Token ' + token}
        };
        return axios.create(params);
}
```

We reference the file `../config/Api` in the last two code-blocks. Here’s what that file looks like — it’s simply a file to map constants to endpoints, making the code more readable and easier to modify later.

```javascript
export const URL = process.env.API_URL;
export const LOGIN = "/auth";
```

That’s all there is to it to connect our frontend to our backend. You can now try using the `Auth.js` login function to get the auth token for the user we created earlier. If you do, you can look at your browser’s dev tools to check the output from redux-logger to see the result of the setToken redux action.

___

I would love to hear some feedback from others about this setup: how could I potentially improve it, anything that needs changing or could be done better, etc.

Internally at work we have a git repository with a template React/DRF setup that we clone for each new project. Hopefully I can open this up to the public and link it here but I should ask for permission first— and I’m writing this blog post late at night so it will have to wait until tomorrow.

## Dev Info

Settings in the Dev environment:

### Superuser

- __User Name__: admin
- __Password__: ssn724SDF

### OAuth App in DEV (not accessible outside dev environment)

- __Client Id:__ YligNZTAGXY6nJ3717tPqFuVf5yb68ymHHqNqJt9
- __Client Secret:__ CUzoq4K0Dlg9w9V057vKr3mf8x6fUBtGcssRSdg65NfuPaFHRoOwwOoJTjV9bf9p4yUbeVTvkZ7gWsIJ1WymwazS7Oi2hn3MRcS86jKzfqW9wmzd0DgUSvisNEIoj532
