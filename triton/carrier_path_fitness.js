
// stars = []
// star = {ships: 0, prod: 0, id: 0}
function fitness(stars, carrierPaths) {
    prod[s] = [0, 0, ...]
    ships[s] = [0, 0, ...]

    carrierArrival[c] = [0, 0, 0, ...]
    carrierShips[c] = [0, 0, 0, 0, ...]
    carrierPaths[c] = [[], [], [], ...]

    for (t from 0 to 1000):
        // carrier movement
        for carrier in carriers:
            carrierArrival[c] -= 1
            if (carrierArrival[c] <= 0) {
                s = carrierPaths[c].shift()
                next = carrierPaths[c][0]

                carrierArrival[c] = distance(carrier, next)

                if (distance(s, goal) > distance(next, goal)) {
                    // pickup
                    ships[s] += carrierShips[c]
                    carrierShips[c] = 0;
                } else {
                    //drop
                    carrierShips[c] += ships[s];
                    ships[s] += 0
                }
            }

        // ship production
        for s in stars:
            ships[s] += prod[s]

    return ships[goal]
}
