-- show details about a reservation and details about the property associated with the reservation.
SELECT reservations.id as id, properties.title, properties.cost_per_night as cost_per_night, start_date, avg(property_reviews.rating) as average_rating
FROM reservations
JOIN properties ON reservations.property_id = properties.id
JOIN property_reviews ON property_reviews.property_id = properties.id
WHERE reservations.guest_id = 1
GROUP BY properties.id, reservations.id
ORDER BY start_date 
LIMIT 10;