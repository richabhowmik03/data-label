import React from 'react';
import { Edit, Trash2, ToggleLeft, ToggleRight, List } from 'lucide-react';
import { Rule } from '../types/Rule';

interface RulesListProps {
  rules: Rule[];
  onRuleEdit: (rule: Rule) => void;
  onRuleDelete: (ruleId: string) => void;
  onRuleToggle: (ruleId: string) => void;
}

const RulesList: React.FC<RulesListProps> = ({
  rules,
  onRuleEdit,
  onRuleDelete,
  onRuleToggle
}) => {
  const formatConditions = (conditions: any): string => {
    if (conditions.type === 'condition') {
      return `${conditions.key} ${conditions.operator} "${conditions.value}"`;
    } else if (conditions.type === 'group') {
      const formattedConditions = conditions.conditions.map((cond: any) => {
        if (cond.type === 'condition') {
          return `${cond.key} ${cond.operator} "${cond.value}"`;
        } else {
          return `(${formatConditions(cond)})`;
        }
      });
      return formattedConditions.join(` ${conditions.operator} `);
    }
    return '';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <List className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Rules ({rules.length})
        </h3>
      </div>

      {rules.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <List className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-gray-500">No rules created yet</p>
          <p className="text-sm text-gray-400">Create your first rule to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className={`border rounded-lg p-4 transition-all duration-200 ${
                rule.enabled
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-gray-900">{rule.name}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      rule.enabled
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {rule.enabled ? 'Active' : 'Disabled'}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      Priority: {rule.priority}
                    </span>
                  </div>

                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-700">Label: </span>
                    <span className="inline-flex items-center px-2 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-md">
                      {rule.label}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 font-mono bg-gray-100 p-2 rounded">
                    {formatConditions(rule.conditions)}
                  </div>

                  <div className="mt-2 text-xs text-gray-500">
                    Created: {new Date(rule.createdAt).toLocaleDateString()}
                    {rule.updatedAt !== rule.createdAt && (
                      <span className="ml-2">
                        • Updated: {new Date(rule.updatedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => onRuleToggle(rule.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title={rule.enabled ? 'Disable rule' : 'Enable rule'}
                  >
                    {rule.enabled ? (
                      <ToggleRight className="h-5 w-5 text-green-600" />
                    ) : (
                      <ToggleLeft className="h-5 w-5 text-gray-400" />
                    )}
                  </button>

                  <button
                    onClick={() => onRuleEdit(rule)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit rule"
                  >
                    <Edit className="h-4 w-4 text-blue-600" />
                  </button>

                  <button
                    onClick={() => onRuleDelete(rule.id)}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                    title="Delete rule"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RulesList;