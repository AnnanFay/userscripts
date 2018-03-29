def combat(universe, star):
    fleets = star.fleets_in_orbit

    # if the star is not owned, give the star bonus to the fleet who was
    # closest to the star before moving.
    # we can now assume that the star is owned by _somebody_
    if not star.player:
        closest_fleet = fleets[0]
        for f in fleets:
            if f.last_jump_dist < closest_fleet.last_jump_dist:
                closest_fleet = f
        star.player = closest_fleet.player

    # begin a report that tells the state of the star before the battle
    recipients = [star.player.user_id]
    for fleet in fleets:
        if fleet.player.user_id not in recipients:
            recipients.append(fleet.player.user_id)

    star_report = {}
    star_report["name"] = star.name
    star_report["uid"] = star.uid
    star_report["ss"] = star.strength
    star_report["es"] = 0  # end strength will be filled in after the battle
    star_report["puid"] = star.player.uid
    star_report["w"] = star.player.weapons.value

    # Sort all ships into teams.
    # Defenders are all ships allied with the owner of the star.
    # Attackers are all ships not allies with the star owner.
    attackers = []
    defenders = [star]
    attacker_total_strength = 0
    defender_total_strength = star.strength
    for fleet in fleets:
        if fleet.player.is_at_war(star.player):
            attackers.append(fleet)
            attacker_total_strength += fleet.strength
        else:
            defenders.append(fleet)
            defender_total_strength += fleet.strength

    if not len(attackers):
        # everybody is friends here so there is no need for combat
        return

    universe.log_hostility(star.player, attackers[0].player)

    # Calculate the defenders WS which is the best of all defenders +1
    # Calculate the attackers WS which is the best of all attackers.
    attacker_weapons = attackers[0].player.weapons.value
    for attacker in attackers:
        if attacker.player.weapons.value > attacker_weapons:
            attacker_weapons = attacker.player.weapons.value

    defender_weapons = star.player.weapons.value
    for defender in defenders:
        if defender.player.weapons.value > defender_weapons:
            defender_weapons = defender.player.weapons.value

    # defenders get home star ws advantage.
    defender_weapons += 1

    # begin a report that tells the state of each fleet before the battle
    attacker_report = {}
    defender_report = {}
    def report_fleet(fleet):
        report = {}
        report["n"] = fleet.name
        report["ss"] = fleet.strength
        report["es"] = 0
        report["puid"] = fleet.player.uid
        report["w"] = fleet.player.weapons.value
        return report

    for attacker in attackers:
        attacker_report[attacker.uid] = report_fleet(attacker)
    for defender in defenders:
        if isinstance(defender, Fleet):
            defender_report[defender.uid] = report_fleet(defender)

    # work out who won and which team won and what how many ships in the
    # winner should lose in damage.
    attacker_rounds_survived = math.ceil(attacker_total_strength / defender_weapons)
    defender_rounds_survived = math.ceil(defender_total_strength / attacker_weapons)

    attackers_win = False
    if defender_rounds_survived >= attacker_rounds_survived:
        winners = defenders
        winner_total_strength = defender_total_strength
        losers = attackers
        damage = (attacker_rounds_survived - 1) * attacker_weapons
    else:
        attackers_win = True
        winners = attackers
        winner_total_strength = attacker_total_strength
        losers = defenders
        damage = (defender_rounds_survived ) * defender_weapons

    # kill all the losers
    for loser in losers:
        loser.strength = 0

    # sort the winners by strength
    winners = sorted(winners, key=lambda f: (f.strength))

    # iterate though the winning carriers distributing damage fairly
    damage_to_distribute = int(damage)
    for winner in winners:
        if not damage_to_distribute or winner.strength < 1: continue
        winners_damage = int(math.floor(damage / (winner_total_strength / winner.strength)))

        # if this winners damage is more that what is left to be distributed,
        # reduce it.
        if damage_to_distribute < winners_damage:
            winners_damage = damage_to_distribute

        if winner.strength < winners_damage:
            damage_to_distribute -= winners.strength
            winner.strength = 0
        else:
            winner.strength -= winners_damage
            damage_to_distribute -= winners_damage

    # handle the case where rounding meant that not all damage was dealt
    while damage_to_distribute > 0:
        for winner in winners:
            if damage_to_distribute <= 0:
                break
            if winner.strength > 0:
                # don't allow any strength to go lower than 0
                winner.strength -= 1
            damage_to_distribute -= 1

    # give the star to the winning player with the most ships remaining.
    total_player_strengths = {}
    for winner in winners:
        if winner.player not in total_player_strengths:
            total_player_strengths[winner.player] = winner.strength
        else:
            total_player_strengths[winner.player] += winner.strength

    largest_player = None
    largest_strength = 0
    for player, strength in total_player_strengths.iteritems():
        if not largest_player:
            largest_player = player
            largest_strength = strength
        if strength > largest_strength:
            largest_player = player
            largest_strength = strength

    loot = 0
    if attackers_win:
        star.player = largest_player
        loot = star.economy * 10
        largest_player.cash += loot
        star.economy = 0
        star.calc_resources()

    # the final strength of the star.
    star_report["es"] = star.strength

    # the final strengths of the fleets.
    for attacker in attackers:
        attacker_report[attacker.uid]["es"] = attacker.strength
    for defender in defenders:
        if isinstance(defender, Fleet):
            defender_report[defender.uid]["es"] = defender.strength

    # The combat report
    data = {"template": "combat_mk_ii",
            "star": star_report,
            "attackers": attacker_report,
            "defenders": defender_report,
            "dw": defender_weapons,
            "aw": attacker_weapons,
            "loot": loot,
            "looter": star.player.uid,
            }

    universe.create_event(recipients, data)

    return True