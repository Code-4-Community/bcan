# Shared Types
1. Attachment
2. Grant
3. Notification
4. Status
5. User

## Caveat
* Right now with this design, this forces us to include all directories in the backend, if you notice the tsconfig rootDir is now referencing bcan/ instead of bcan/backend/src/.
* Not sure why the above was not a problem for the frontend..