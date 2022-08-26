const properties = require('./json/properties.json');
const users = require('./json/users.json');

// connect to databse using node-postgres
const { Pool } = require('pg');

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});


pool.query(`SELECT title FROM properties LIMIT 10;`)
  .then(response => {})

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = (emailAddress) => {
  return pool
    .query(`SELECT * FROM users WHERE email = $1`, [emailAddress])
    .then((result) => {
      if (!result.rows.length) {
        return null;
      }
      return result.rows[0];
    })
    .catch((err) => {
      console.log(err.message);
    });
}

exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
 const getUserWithId = (userId) => {
  return pool
    .query(`SELECT * FROM users WHERE id = $1`, [userId])
    .then((result) => {
      if (!result.rows.length) {
        return null;
      }
      return result.rows[0];
    })
    .catch((err) => {
      console.log(err.message);
    });
}

exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = (user) => {
  let values = [user.name, user.email, user.password];
  return pool
  .query(`
  INSERT INTO users (name, email, password)
  VALUES ($1, $2, $3)
  RETURNING *;`, values)
  .then((result) => {
    return result.rows[0];
  })
  .catch((err) => {
    console.log(err.message);
  });

}
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  const values = [guest_id, limit];
  return pool
  .query(`
  SELECT reservations.id as id, properties.title, properties.thumbnail_photo_url as thumbnail_photo_url, properties.cost_per_night as cost_per_night, start_date, avg(property_reviews.rating) as average_rating
  FROM reservations
  JOIN properties ON reservations.property_id = properties.id
  JOIN property_reviews ON property_reviews.property_id = properties.id
  WHERE reservations.guest_id = $1
  GROUP BY properties.id, reservations.id
  ORDER BY start_date 
  LIMIT $2`, values)
  .then((result) => {
    console.log("result is: ", result.rows);
    return result.rows;
  })
  .catch((err) => {
    console.log(err.message);
  });
}
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
 const getAllProperties = function (options, limit = 10) {
  // 1
  const queryParams = [];
  // 2
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  `;

  // 3
  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `WHERE city LIKE $${queryParams.length} `;
  }

  if (options.owner_id) {
    queryParams.push(options.owner_id);
    if (queryParams.length < 2) {
      queryString += `WHERE properties.owner_id = $${queryParams.length} `;
    } else {
      queryString += `AND properties.owner_id = $${queryParams.length} `;
    }
  }

  if (options.minimum_price_per_night && options.maximum_price_per_night) {
    //if the price input is in dollars
    const minPrice = options.minimum_price_per_night * 100;
    const maxPrice = options.maximum_price_per_night * 100;
    queryParams.push(minPrice);
    queryParams.push(maxPrice);
    if (queryParams.length < 3) {
      queryString += `WHERE properties.cost_per_night > $${queryParams.length - 1} `;
      queryString += `AND properties.cost_per_night < $${queryParams.length}`;
    } else {
      queryString += `AND properties.cost_per_night > $${queryParams.length - 1} `;
      queryString += `AND properties.cost_per_night < $${queryParams.length} `;

    }
  }
  queryString += `GROUP BY properties.id\n`;

  if (options.minimum_rating) {
    const ratingInt = parseInt(options.minimum_rating);
    queryParams.push(ratingInt);
    // if (queryParams.length < 2) {
      queryString += `HAVING avg(property_reviews.rating) >= $${queryParams.length}`;
    // } else {
    //   queryString += `avgproperty_reviews.rating >= $${queryParams.length} `;
    // }
  }

  // 4
  queryParams.push(limit);
  queryString += `
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;

  // SELECT properties.*, avg(property_reviews.rating) as average_rating
  // FROM properties
  // JOIN property_reviews ON properties.id = property_id
  // WHERE city LIKE 'Vancouver' GROUP BY properties.id

  // ORDER BY cost_per_night
  // LIMIT 10;


  // 5
  console.log(queryString, queryParams);

  // 6
  return pool
    .query(queryString, queryParams)
    // .query(`SELECT * FROM properties WHERE id < $1;`, [5])
    .then((res) => {
      console.log("result is: ", res.rows);

    })
    .catch((err) => {
      console.log(err.message);
    });
};


exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
}
exports.addProperty = addProperty;
