import { expect } from 'chai';
import { describe, it } from 'mocha';
import { IGoapGoal, IGoapAction, GoapPlanner } from '../../lib';

interface IGoapState {
  isAxeAvailable: boolean;
  player: {
    isAxeEquipped: boolean;
    wood: number;
  };
}

class ChopWoodAction implements IGoapAction<IGoapState> {
  readonly label = 'chopWood';

  condition(state: IGoapState): boolean {
    return state.player.isAxeEquipped;
  }

  effect(state: IGoapState): IGoapState {
    state.player.wood++;
    return state;
  }

  cost(/* prev: IGoapState, next: IGoapState */): number {
    return 2;
  }
}

class GetAxeAction implements IGoapAction<IGoapState> {
  readonly label = 'getAxe';

  condition(state: IGoapState): boolean {
    return !state.player.isAxeEquipped && state.isAxeAvailable;
  }

  effect(state: IGoapState): IGoapState {
    state.player.isAxeEquipped = true;
    return state;
  }

  cost(/* state: IGoapState */): number {
    return 2;
  }
}

class GatherWoodAction implements IGoapAction<IGoapState> {
  readonly label = 'gatherWood';

  condition(/* state: IGoapState */): boolean {
    return true;
  }

  effect(state: IGoapState): IGoapState {
    state.player.wood++;
    return state;
  }

  cost(/* state: IGoapState */): number {
    return 5;
  }
}

class CollectWoodGoal implements IGoapGoal<IGoapState> {
  readonly label = 'collectWood';

  validate(prevState: IGoapState, nextState: IGoapState): boolean {
    return nextState.player.wood > prevState.player.wood;
  }
}

describe('gather wood test', () => {
  it('selects the proper actions', () => {
    //Given
    const chopWoodAction = new ChopWoodAction();
    const getAxeAction = new GetAxeAction();
    const gatherWoodAction = new GatherWoodAction();

    const collectWoodGoal = new CollectWoodGoal();

    const goapPlanner = new GoapPlanner<IGoapState>({
      actions: [chopWoodAction, getAxeAction, gatherWoodAction],
      goal: collectWoodGoal,
    });

    const gameState: IGoapState = {
      isAxeAvailable: true,
      player: {
        isAxeEquipped: false,
        wood: 0,
      },
    };

    // When
    const result = goapPlanner.createPlan(gameState);

    // Then
    expect(result).to.deep.equal({
      totalCost: 4,
      goal: 'collectWood',
      actions: [
        { label: 'getAxe', cost: 2, state: { isAxeAvailable: true, player: { isAxeEquipped: true, wood: 0 } } },
        { label: 'chopWood', cost: 4, state: { isAxeAvailable: true, player: { isAxeEquipped: true, wood: 1 } } },
      ],
    });
  });
});
