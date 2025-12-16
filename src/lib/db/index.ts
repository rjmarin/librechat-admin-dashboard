/**
 * Database module exports
 */

export {
	type CollectionName,
	Collections,
	closeConnection,
	// Backward compatibility alias
	connectDB,
	getCollection,
	getDatabase,
} from "./connection";
