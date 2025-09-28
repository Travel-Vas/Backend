"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tripType = exports.Accommodation = exports.transportType = exports.tripStatus = void 0;
var tripStatus;
(function (tripStatus) {
    tripStatus["CANCELED"] = "CANCELED";
    tripStatus["COMPLETED"] = "COMPLETED";
    tripStatus["INPROGRESS"] = "INPROGRESS";
    tripStatus["PENDING"] = "PENDING";
})(tripStatus || (exports.tripStatus = tripStatus = {}));
var transportType;
(function (transportType) {
    transportType["FLIGHT"] = "FLIGHT";
    transportType["TRAIN"] = "TRAIN";
    transportType["BUS"] = "BUS";
})(transportType || (exports.transportType = transportType = {}));
var Accommodation;
(function (Accommodation) {
    Accommodation["HOTEL"] = "HOTEL";
    Accommodation["APARTMENT"] = "APARTMENT";
    Accommodation["RESORT"] = "RESORT";
})(Accommodation || (exports.Accommodation = Accommodation = {}));
var tripType;
(function (tripType) {
    tripType["SOLO"] = "SOLO";
    tripType["GROUP"] = "GROUP";
    tripType["FAMILY"] = "FAMILY";
    tripType["BUSINESS"] = "BUSINESS";
    tripType["LEISURE"] = "LEISURE";
    tripType["ADVENTURE"] = "ADVENTURE";
})(tripType || (exports.tripType = tripType = {}));
