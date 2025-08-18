export interface RuleCondition {
  type: 'condition';
  key: string;
  operator: '=' | '!=' | '<' | '>' | '<=' | '>=';
  value: string;
}

export interface RuleGroup {
  type: 'group';
  operator: 'AND' | 'OR';
  conditions: (RuleCondition | RuleGroup)[];
}

export interface Rule {
  id: string;
  name: string;
  conditions: RuleGroup;
  label: string;
  priority: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}