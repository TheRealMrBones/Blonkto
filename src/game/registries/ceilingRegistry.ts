import Registry from "./registry.js";
import Ceiling from "../world/ceiling.js";

import Constants from "../../shared/constants.js";
const { ASSETS } = Constants;

const CeilingRegistry = new Registry<Ceiling>();



export default CeilingRegistry;