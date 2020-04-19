import { expect } from 'chai';
import { describe, it } from 'mocha';
import { IGoapGoal, IGoapAction, GoapPlanner } from '../../lib';

interface IGoapState {
  player: {
    weaponEquipped: boolean;
    bullets: number;
    clips: number;
  };
  enemy: {
    visible: boolean;
    alive: boolean;
  };
}

class EquipWeaponAction implements IGoapAction<IGoapState> {
  readonly label = 'equipWeapon';

  condition(state: IGoapState): boolean {
    return state.player.weaponEquipped === false;
  }

  effect(state: IGoapState): IGoapState {
    state.player.weaponEquipped = true;
    return state;
  }

  cost(): number {
    return 2;
  }
}

class ReloadWeaponAction implements IGoapAction<IGoapState> {
  readonly label = 'reloadWeapon';

  condition(state: IGoapState): boolean {
    return state.player.weaponEquipped && state.player.clips > 0;
  }

  effect(state: IGoapState): IGoapState {
    state.player.bullets += 6;
    return state;
  }

  cost(): number {
    return 2;
  }
}

class FireWeaponAction implements IGoapAction<IGoapState> {
  readonly label = 'fireWeapon';

  condition(state: IGoapState): boolean {
    return state.enemy.visible === true && state.player.weaponEquipped && state.player.bullets > 0;
  }

  effect(state: IGoapState): IGoapState {
    state.player.bullets--;
    state.enemy.alive = false;
    return state;
  }

  cost(): number {
    return 2;
  }
}

class UseTurretAction implements IGoapAction<IGoapState> {
  readonly label = 'useTurret';

  condition(state: IGoapState): boolean {
    return state.enemy.visible;
  }

  effect(state: IGoapState): IGoapState {
    state.enemy.alive = false;
    return state;
  }

  cost(): number {
    return 10;
  }
}

class KnifeAttackAction implements IGoapAction<IGoapState> {
  readonly label = 'knifeAttack';

  condition(state: IGoapState): boolean {
    return state.enemy.visible;
  }

  effect(state: IGoapState): IGoapState {
    state.enemy.alive = false;
    return state;
  }

  cost(): number {
    return 12;
  }
}

class ScoutAction implements IGoapAction<IGoapState> {
  readonly label = 'scout';

  condition(state: IGoapState): boolean {
    return state.enemy.visible === false;
  }

  effect(state: IGoapState): IGoapState {
    state.enemy.visible = true;
    return state;
  }

  cost(): number {
    return 1;
  }
}

class HideAction implements IGoapAction<IGoapState> {
  readonly label = 'hide';

  condition(): boolean {
    return true;
  }

  effect(state: IGoapState): IGoapState {
    state.enemy.visible = false;
    return state;
  }

  cost(): number {
    return 1;
  }
}

class KillEnemyGoal implements IGoapGoal<IGoapState> {
  readonly label = 'killEnemy';

  validate(prevState: IGoapState, nextState: IGoapState): boolean {
    return nextState.enemy.alive === false;
  }
}

describe('gather wood test', () => {
  it('selects the proper actions', () => {
    //Given
    const equipWeaponAction = new EquipWeaponAction();
    const reloadWeaponAction = new ReloadWeaponAction();
    const fireWeaponAction = new FireWeaponAction();
    const useTurretAction = new UseTurretAction();
    const knifeAttackAction = new KnifeAttackAction();
    const scoutAction = new ScoutAction();
    const hideAction = new HideAction();

    const killEnemyGoal = new KillEnemyGoal();

    const goapPlanner = new GoapPlanner<IGoapState>({
      actions: [
        equipWeaponAction,
        reloadWeaponAction,
        fireWeaponAction,
        useTurretAction,
        knifeAttackAction,
        scoutAction,
        hideAction,
      ],
      goal: killEnemyGoal,
    });

    const gameState: IGoapState = {
      player: {
        weaponEquipped: false,
        bullets: 0,
        clips: 1,
      },
      enemy: {
        visible: false,
        alive: true,
      },
    };

    // When
    const result = goapPlanner.createPlan(gameState);

    console.log(JSON.stringify(result));

    // Then
    expect(result).to.deep.equal({
      totalCost: 7,
      goal: 'killEnemy',
      actions: [
        {
          label: 'equipWeapon',
          cost: 2,
          state: {
            player: {
              weaponEquipped: true,
              bullets: 0,
              clips: 1,
            },
            enemy: {
              visible: false,
              alive: true,
            },
          },
        },
        {
          label: 'reloadWeapon',
          cost: 4,
          state: {
            player: {
              weaponEquipped: true,
              bullets: 6,
              clips: 1,
            },
            enemy: {
              visible: false,
              alive: true,
            },
          },
        },
        {
          label: 'scout',
          cost: 5,
          state: {
            player: {
              weaponEquipped: true,
              bullets: 6,
              clips: 1,
            },
            enemy: {
              visible: true,
              alive: true,
            },
          },
        },
        {
          label: 'fireWeapon',
          cost: 7,
          state: {
            player: {
              weaponEquipped: true,
              bullets: 5,
              clips: 1,
            },
            enemy: {
              visible: true,
              alive: false,
            },
          },
        },
      ],
    });
  });
});
