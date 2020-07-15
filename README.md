# Looker Extension Kitchensink Template (React & TypeScript)

This repository demonstrates how to write a Looker extension that needs an API key to run.

It uses [React](https://reactjs.org/) and [TypeScript](https://www.typescriptlang.org/) for writing your extension, the [React Extension SDK](https://github.com/looker-open-source/extension-sdk-react) for interacting with Looker, and [Webpack](https://webpack.js.org/) for building your code.

This version of the Kitchen sink requires Looker 7.9 or above.

## Getting Started for Development

1. Clone or download a copy of this template to your development machine

2. Navigate (`cd`) to the template directory on your system

3. Install the dependencies with [Yarn](https://yarnpkg.com/).

```
yarn install
```

You may need to update your Node version or use a [Node version manager](https://github.com/nvm-sh/nvm) to change your Node version.

4. Start the development server

```
yarn start
```

5. Log in to Looker and create a new project.

   This is found under **Develop** => **Manage LookML Projects** => **New LookML Project**.

   You'll want to select "Blank Project" as your "Starting Point". You'll now have a new project with no files.

   1. In your copy of the extension project you have `manifest.lkml` file.

   You can either drag & upload this file into your Looker project, or create a `manifest.lkml` with the same content. Change the `id`, `label`, or `url` as needed.

```
  project_name: "apikey_demo"

  application:apikey_demo {
    label: "APIKEY demo"
    url: "http://localhost:8080/bundle.js"

    entitlements: {
      allow_forms: yes
      core_api_methods: ["me", "all_user_attributes", "delete_user_attribute", "create_user_attribute"]
      external_api_urls: ["http://127.0.0.1:3000", "http://localhost:3000"]
    }
  }
```

6. Create a `model` LookML file in th project. The convention is to name the model the same as the extension.

- Add a connection in this model. It can be any connection, it doesn't matter which.
- [Configure the model you created](https://docs.looker.com/data-modeling/getting-started/create-projects#configuring_a_model) so that it has access to some connection.

7. Connect your new project to Git. You can do this multiple ways:

- Create a new repository on GitHub or a similar service, and follow the instructions to [connect your project to Git](https://docs.looker.com/data-modeling/getting-started/setting-up-git-connection)
- A simpler but less powerful approach is to set up git with the "Bare" repository option which does not require connecting to an external Git Service.

8. Commit your changes and deploy your them to production through the Project UI.

9. Reload the page and click the `Browse` dropdown menu. You should see the extension in the list.

- The extension will load the JavaScript from the `url` you provided in the `application` definition/
- Reloading the extension page will bring in any new code changes from the extension template.

10. The demonstration requires that a json data server be running. To start the server run the command

```
yarn start-server
```

#### License key setup

Create a .env file with the following entries. Use a password generator to create the values. These values should be set prior to starting the development and data servers. Do NOT store the .env file in your source code repository.

```
LICENSE_KEY=
JWT_TOKEN_SECRET=
```

## Run the extension

Use the browse menu to navigate to the extension. The license check will fail because it has not been added. Click the Add/Update button and enter the LICENSE_KEY added to the .env file. Navigate back to the Home page. The license check should now work. Click the Verify JWT to validate the JWT token.

## Production Deployment

The process above requires your local development server to be running to load the extension code. To allow other people to use the extension, we can build the JavaScript file and include it in the project directly.

1. In your extension project directory on your development machine you can build the extension with `yarn build`.
2. Drag and drop the generated `dist/bundle.js` file into the Looker project interface
3. Modify your `manifest.lkml` to use `file` instead of `url`:
   ```
   project_name: "apikey_demo"
   application:apikey_demo {
    label: "APIKEY demo"
    file: "bundle.js"
    entitlements: {
      allow_forms: yes
      core_api_methods: ["me", "all_user_attributes", "delete_user_attribute", "create_user_attribute"]
      external_api_urls: ["http://127.0.0.1:3000", "http://localhost:3000"]
    }
   }
   ```

## Notes

- Webpack's module splitting is not currently supported.
- The template uses Looker's component library and styled components. Neither of these libraries are required so you may remove and replace them with a component library of your own choice,

## Related Projects

- [Looker React extension template](https://github.com/looker-open-source/extension-template-react)
- [Looker React/Redux extension template ](https://github.com/looker-open-source/extension-template-redux)
- [Looker extension SDK](https://www.npmjs.com/package/@looker/extension-sdk)
- [Looker extension SDK for React](https://www.npmjs.com/package/@looker/extension-sdk-react)
- [Looker SDK](https://www.npmjs.com/package/@looker/sdk)
- [Looker Embed SDK](https://github.com/looker-open-source/embed-sdk)
- [Looker Components](https://components.looker.com/)
- [Styled components](https://www.styled-components.com/docs)
