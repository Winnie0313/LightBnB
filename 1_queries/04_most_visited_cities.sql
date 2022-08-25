-- a query to see a list of the most visited cities.
SELECT properties.city as city, count(reservations.*) as total_reservations
FROM reservations
JOIN properties ON property_id = properties.id
GROUP BY properties.city
ORDER BY count(reservations.*) DESC;