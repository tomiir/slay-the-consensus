import { Card, CardEffect, Character, GameState, BattleResult } from './types';
import { shuffle } from './utils';

export class BattleSystem {
  private state: GameState;
  private battleResult: Partial<BattleResult>;

  constructor(deck: Card[], playerHealth: number = 75) {
    // Initialize game state
    this.state = {
      player: {
        health: playerHealth,
        maxHealth: playerHealth,
        block: 0,
        energy: 3,
        maxEnergy: 3,
        effects: {}
      },
      enemy: {
        health: 20,
        maxHealth: 20,
        block: 0,
        energy: 0,
        maxEnergy: 0,
        effects: {}
      },
      deck: [...deck],
      hand: [],
      discardPile: [],
      drawPile: [],
      turn: 1
    };

    this.battleResult = {
      victory: false,
      turnsPlayed: 0,
      damageDealt: 0,
      damageTaken: 0,
      cardsPlayed: 0
    };

    // Initialize draw pile
    this.state.drawPile = shuffle([...this.state.deck]);
    this.drawCards(5); // Initial hand
  }

  private drawCards(count: number): void {
    for (let i = 0; i < count; i++) {
      if (this.state.drawPile.length === 0) {
        // Reshuffle discard pile if draw pile is empty
        this.state.drawPile = shuffle([...this.state.discardPile]);
        this.state.discardPile = [];
      }
      if (this.state.drawPile.length > 0) {
        const card = this.state.drawPile.pop()!;
        this.state.hand.push(card);
      }
    }
  }

  private applyEffect(effect: CardEffect, source: Character, target: Character): void {
    switch (effect.type) {
      case 'damage':
        const damage = Math.max(0, effect.value - target.block);
        target.block = Math.max(0, target.block - effect.value);
        target.health -= damage;
        if (target === this.state.enemy) {
          this.battleResult.damageDealt! += damage;
        } else {
          this.battleResult.damageTaken! += damage;
        }
        break;
      case 'block':
        source.block += effect.value;
        break;
      case 'heal':
        source.health = Math.min(source.maxHealth, source.health + effect.value);
        break;
      case 'poison':
        target.effects.poison = (target.effects.poison || 0) + effect.value;
        break;
      case 'energy':
        source.energy = Math.min(source.maxEnergy, source.energy + effect.value);
        break;
      case 'draw':
        this.drawCards(effect.value);
        break;
    }
  }

  public playCard(cardIndex: number): boolean {
    const card = this.state.hand[cardIndex];
    if (!card || this.state.player.energy < card.energy) {
      return false;
    }

    // Remove card from hand and add to discard pile
    this.state.hand.splice(cardIndex, 1);
    this.state.discardPile.push(card);

    // Apply card effects
    this.state.player.energy -= card.energy;
    for (const effect of card.effects) {
      const source = effect.target === 'enemy' ? this.state.player : this.state.player;
      const target = effect.target === 'enemy' ? this.state.enemy : this.state.player;
      this.applyEffect(effect, source, target);
    }

    this.battleResult.cardsPlayed!++;
    return true;
  }

  public endTurn(): void {
    // Process enemy turn
    this.processEnemyTurn();

    // Process status effects
    this.processStatusEffects(this.state.enemy);
    this.processStatusEffects(this.state.player);

    // Reset player stats for new turn
    this.state.player.energy = this.state.player.maxEnergy;
    this.state.player.block = 0;

    // Discard hand and draw new cards
    this.state.discardPile.push(...this.state.hand);
    this.state.hand = [];
    this.drawCards(5);

    this.state.turn++;
    this.battleResult.turnsPlayed = this.state.turn;
  }

  private processStatusEffects(character: Character): void {
    if (character.effects.poison) {
      character.health -= character.effects.poison;
      character.effects.poison--;
    }
  }

  private processEnemyTurn(): void {
    // Simple enemy AI - alternates between attacking and defending
    if (this.state.turn % 2 === 0) {
      // Attack turn
      const damage = 8;
      const playerDamage = Math.max(0, damage - this.state.player.block);
      this.state.player.block = Math.max(0, this.state.player.block - damage);
      this.state.player.health -= playerDamage;
      this.battleResult.damageTaken! += playerDamage;
    } else {
      // Defend turn
      this.state.enemy.block += 5;
    }
  }

  public getState(): GameState {
    return { ...this.state };
  }

  public getBattleResult(): BattleResult | null {
    if (this.state.player.health <= 0 || this.state.enemy.health <= 0) {
      return {
        ...this.battleResult,
        victory: this.state.enemy.health <= 0
      } as BattleResult;
    }
    return null;
  }
} 