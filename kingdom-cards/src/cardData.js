// Kingdom Cards - Card Data
// 30 starter cards with battle stats

const CARD_DATA = {
    // RULERS (Throne)
    'warden_whiskers': { name: 'Warden Whiskers', rarity: 'legendary', elixir: 5, hp: 600, damage: 50, speed: 1, type: 'ruler', ability: 'leader' },
    'boss_betty': { name: 'Boss Betty', rarity: 'epic', elixir: 4, hp: 500, damage: 40, speed: 1, type: 'ruler', ability: 'leader' },
    'governor_griz': { name: 'Governor Griz', rarity: 'rare', elixir: 3, hp: 400, damage: 35, speed: 1, type: 'ruler', ability: 'leader' },
    'mayor_moe': { name: 'Mayor Moe', rarity: 'uncommon', elixir: 2, hp: 300, damage: 25, speed: 1, type: 'ruler', ability: 'leader' },
    'keeper_kevin': { name: 'Keeper Kevin', rarity: 'common', elixir: 1, hp: 200, damage: 15, speed: 1, type: 'ruler', ability: 'leader' },
    
    // NOBILITY (Military)
    'captain_ironjaw': { name: 'Captain Ironjaw', rarity: 'rare', elixir: 4, hp: 450, damage: 55, speed: 2, type: 'knight', ability: 'charge' },
    'sgt_bust_through': { name: 'Sgt. Bust-Through', rarity: 'common', elixir: 2, hp: 250, damage: 35, speed: 3, type: 'knight', ability: 'charge' },
    'guard_gertrude': { name: 'Guard Gertrude', rarity: 'uncommon', elixir: 3, hp: 350, damage: 40, speed: 1, type: 'knight', ability: 'shield' },
    
    // CLERGY (Spiritual)
    'sister_solitaire': { name: 'Sister Solitaire', rarity: 'epic', elixir: 4, hp: 200, damage: 0, speed: 1, type: 'cleric', ability: 'heal', healAmount: 150 },
    'reverend_scoops': { name: 'Reverend Scoops', rarity: 'uncommon', elixir: 2, hp: 150, damage: 0, speed: 1, type: 'cleric', ability: 'heal', healAmount: 80 },
    'priest_peter': { name: 'Priest Peter', rarity: 'common', elixir: 1, hp: 100, damage: 0, speed: 1, type: 'cleric', ability: 'buff', buffAmount: 20 },
    'chaplain_chuck': { name: 'Chaplain Chuck', rarity: 'uncommon', elixir: 2, hp: 120, damage: 0, speed: 2, type: 'cleric', ability: 'speed', speedBuff: 50 },
    
    // PEASANTS (Treasury)
    'tunnel_terry': { name: 'Tunnel Terry', rarity: 'common', elixir: 2, hp: 180, damage: 30, speed: 3, type: 'swarm', ability: 'swarm' },
    'shank_shank': { name: 'Shank-Shank', rarity: 'rare', elixir: 3, hp: 150, damage: 75, speed: 4, type: 'assassin', ability: 'lethal' },
    'chef_sack_o_rice': { name: 'Chef Sack-O-Rice', rarity: 'common', elixir: 1, hp: 100, damage: 10, speed: 1, type: 'support', ability: 'feed', feedAmount: 30 },
    'farmer_frank': { name: 'Farmer Frank', rarity: 'uncommon', elixir: 2, hp: 200, damage: 25, speed: 2, type: 'swarm', ability: 'swarm' },
    'miner_mike': { name: 'Miner Mike', rarity: 'rare', elixir: 3, hp: 350, damage: 45, speed: 1, type: 'siege', ability: 'building' },
    
    // BUILDINGS (Defense)
    'the_block': { name: 'The Block', rarity: 'uncommon', elixir: 3, hp: 400, damage: 20, speed: 0, type: 'building', ability: 'block' },
    'yard_tower': { name: 'Yard Tower', rarity: 'rare', elixir: 4, hp: 500, damage: 45, speed: 0, type: 'building', ability: 'ranged' },
    'stone_citadel': { name: 'Stone Citadel', rarity: 'epic', elixir: 5, hp: 700, damage: 30, speed: 0, type: 'building', ability: 'boss' },
    'motte_bailey': { name: 'Motte & Bailey', rarity: 'common', elixir: 2, hp: 250, damage: 15, speed: 0, type: 'building', ability: 'basic' },
    'blacksmith_bob': { name: 'Blacksmith Bob', rarity: 'uncommon', elixir: 3, hp: 200, damage: 0, speed: 1, type: 'support', ability: 'repair', repairAmount: 100 },
    
    // CREATURES (Military)
    'mcgluff': { name: 'McFluff', rarity: 'legendary', elixir: 6, hp: 800, damage: 80, speed: 2, type: 'creature', ability: 'aoe', aoe: true },
    'chimera_chomp': { name: 'Chimera Chomp', rarity: 'epic', elixir: 5, hp: 600, damage: 65, speed: 2, type: 'creature', ability: 'poison' },
    'griffin_greg': { name: 'Griffin Greg', rarity: 'rare', elixir: 4, hp: 400, damage: 50, speed: 4, type: 'creature', ability: 'flying' },
    'wolfie': { name: 'Wolfie', rarity: 'common', elixir: 2, hp: 150, damage: 35, speed: 5, type: 'creature', ability: 'fast' },
    
    // DECREES (Spells)
    'free_for_all': { name: 'FREE FOR ALL', rarity: 'epic', elixir: 4, hp: 0, damage: 0, speed: 0, type: 'spell', ability: 'rage', duration: 5 },
    'lockdown': { name: 'LOCKDOWN', rarity: 'rare', elixir: 3, hp: 0, damage: 0, speed: 0, type: 'spell', ability: 'freeze', duration: 3 },
    'snitch': { name: 'SNITCH', rarity: 'uncommon', elixir: 2, hp: 0, damage: 0, speed: 0, type: 'spell', ability: 'reveal' },
    'amnesty': { name: 'AMNESTY', rarity: 'common', elixir: 1, hp: 0, damage: 0, speed: 0, type: 'spell', ability: 'heal', healAll: 20 }
};

const RARITY_COLORS = {
    common: 0xB0B0B0,
    uncommon: 0x4CAF50,
    rare: 0x2196F3,
    epic: 0x9C27B0,
    legendary: 0xFF9800
};

const RARITY_GLOW = {
    common: 0,
    uncommon: 0.2,
    rare: 0.4,
    epic: 0.6,
    legendary: 0.8
};