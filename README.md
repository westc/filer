# Filer
This is an Electron desktop app which gives you the ability to rename and move files in bulk.

## Setup
1. Install node and npm
2. Either clone or download this repo.
3. Navigate to the root directory of this project.
4. Run `npm install`.
5. To run the app without actually building it you can run `npm start`.
6. To build the app you will want to make sure the `scripts.build` params are correct in `package.json` and then you can run `npm run build`.
   * You need to include the platform and the architecture arguments when building.

      Eg. `npm run build -- --platform=darwin --arch=x64`
