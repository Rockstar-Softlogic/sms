import { Meteor } from 'meteor/meteor';

import { Template } from 'meteor/templating';

import './index.html'; // main body 

import '../imports/public/client/main.js'; // public client js code

import '../imports/auth.js'; //Authenticated users client code

Template.registerHelper("g.Schemas", g.Schemas);
