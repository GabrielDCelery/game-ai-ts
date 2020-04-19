import PriorityQueue = require('fastpriorityqueue');

export interface IGoapAction<TGoapState> {
  readonly label: string;
  condition(state: TGoapState): boolean;
  effect(state: TGoapState): TGoapState;
  cost(prevState: TGoapState, nextState: TGoapState): number;
}

export interface IGoapGoal<TGoapState> {
  readonly label: string;
  validate(prevState: TGoapState, nextState: TGoapState): boolean;
}

class GoapNode<TGoapState> {
  readonly action: IGoapAction<TGoapState> | null;
  readonly cost: number;
  readonly label: string | null;
  readonly parent: GoapNode<TGoapState> | null;
  readonly state: TGoapState;

  constructor({
    parent,
    cost,
    state,
    action,
    cloneStateMethod,
  }: {
    parent: GoapNode<TGoapState> | null;
    cost: number;
    state: TGoapState;
    action: IGoapAction<TGoapState> | null;
    cloneStateMethod: (state: TGoapState) => TGoapState;
  }) {
    this.action = action;
    this.cost = cost;
    this.label = action ? action.label : null;
    this.parent = parent;
    this.state = cloneStateMethod(state);
  }
}

export interface IGoapPlannerResult<TGoapState> {
  totalCost: number;
  goal: string;
  actions: {
    cost: number;
    state: TGoapState;
    label: string;
  }[];
}

export class GoapPlanner<TGoapState> {
  readonly actions: IGoapAction<TGoapState>[];
  readonly goal: IGoapGoal<TGoapState>;

  constructor({
    actions,
    goal,
    cloneStateMethod,
  }: {
    actions: IGoapAction<TGoapState>[];
    goal: IGoapGoal<TGoapState>;
    cloneStateMethod?: (state: TGoapState) => TGoapState;
  }) {
    this.actions = actions;
    this.goal = goal;
    this.cloneState = cloneStateMethod ? cloneStateMethod : this.cloneState;
    this.cloneState = this.cloneState.bind(this);
  }

  private cloneState(state: TGoapState): TGoapState {
    return JSON.parse(JSON.stringify(state));
  }

  private buildActionGraph({
    parent,
    leaves,
    actions,
  }: {
    parent: GoapNode<TGoapState>;
    leaves: PriorityQueue<GoapNode<TGoapState>>;
    actions: IGoapAction<TGoapState>[];
  }): PriorityQueue<GoapNode<TGoapState>> {
    actions.forEach(action => {
      if (action.condition(parent.state) !== true) {
        return;
      }
      const prevState = parent.state;
      const nextState = action.effect(this.cloneState(prevState));
      const cost = parent.cost + action.cost(prevState, nextState);
      const node = new GoapNode({ parent, cost, state: nextState, action, cloneStateMethod: this.cloneState });
      if (this.goal.validate(parent.state, nextState)) {
        return leaves.add(node);
      }
      const restOfViableActions = actions.filter(a => a.label !== action.label);
      return this.buildActionGraph({ parent: node, leaves, actions: restOfViableActions });
    });

    return leaves;
  }

  private extractBestPlanFromActionGraph(
    leaves: PriorityQueue<GoapNode<TGoapState>>
  ): null | IGoapPlannerResult<TGoapState> {
    let node = leaves.poll();
    if (!node) {
      return null;
    }
    const plan = [];
    const totalCost = node.cost;
    while (node) {
      if (node.action) {
        plan.unshift(node);
      }
      node = node.parent ? node.parent : undefined;
    }
    return {
      totalCost,
      goal: this.goal.label,
      actions: plan.map(({ cost, state, label }) => {
        return { label: (label as unknown) as string, cost, state };
      }),
    };
  }

  createPlan(state: TGoapState): null | IGoapPlannerResult<TGoapState> {
    const root = new GoapNode({
      parent: null,
      cost: 0,
      state,
      action: null,
      cloneStateMethod: this.cloneState,
    });
    const leaves = new PriorityQueue<GoapNode<TGoapState>>((a, b) => a.cost < b.cost);
    this.buildActionGraph({ parent: root, leaves, actions: this.actions });
    return this.extractBestPlanFromActionGraph(leaves);
  }
}
