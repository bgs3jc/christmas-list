// The data layer. Every read and write in the app goes through this folder;
// components never talk to Firebase or browser storage directly.
//
// M3 adds a browser-storage version so the prototype works with no server.
// M4 swaps in Firebase here, without changing any components.

export {}
