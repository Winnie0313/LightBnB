-- view the properties and filter them by location. 
-- see all data about the property, including the average rating.

SELECT properties.id as id, title, cost_per_night, city, avg(property_reviews.rating) as average_rating
FROM properties
JOIN property_reviews ON properties.id = property_id
WHERE city LIKE '%Vancouver%'
GROUP BY properties.id
HAVING avg(property_reviews.rating) >= 4
ORDER BY cost_per_night
LIMIT 10;

