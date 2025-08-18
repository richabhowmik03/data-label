import React, { useState, useEffect } from 'react';
import { Plus, Minus, Save, X, Settings } from 'lucide-react';
import { Rule, RuleCondition, RuleGroup } from '../types/Rule';

interface RuleBuilderProps {
  availableKeys: string[];
  selectedRule: Rule | null;
  onRuleCreate: (rule: Omit<Rule, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onRuleUpdate: (rule: Rule) => Promise<void>;
  onCancel: () => void;
}

const operators = [
  { value: '=', label: 'equals (=)' },
  { value: '!=', label: 'not equals (!=)' },
  { value: '<', label: 'less than (<)' },
  { value: '>', label: 'greater than (>)' },
  { value: '<=', label: 'less than or equal (<=)' },
  { value: '>=', label: 'greater than or equal (>=)' }
];

const RuleBuilder: React.FC<RuleBuilderProps> = ({
  availableKeys,
  selectedRule,
  onRuleCreate,
  onRuleUpdate,
  onCancel,
  isDarkMode
}) => {
  const [ruleName, setRuleName] = useState('');
  const [ruleLabel, setRuleLabel] = useState('');
  const [rulePriority, setRulePriority] = useState(1);
  const [conditions, setConditions] = useState<RuleGroup>({
    type: 'group',
    operator: 'AND',
    conditions: [{
      type: 'condition',
      key: '',
      operator: '=',
      value: ''
    }]
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedRule) {
      setRuleName(selectedRule.name);
      setRuleLabel(selectedRule.label);
      setRulePriority(selectedRule.priority);
      setConditions(selectedRule.conditions);
    } else {
      resetForm();
    }
  }, [selectedRule]);

  const resetForm = () => {
    setRuleName('');
    setRuleLabel('');
    setRulePriority(1);
    setConditions({
      type: 'group',
      operator: 'AND',
      conditions: [{
        type: 'condition',
        key: '',
        operator: '=',
        value: ''
      }]
    });
    setErrors([]);
  };

  const validateRule = () => {
    const newErrors: string[] = [];

    if (!ruleName.trim()) newErrors.push('Rule name is required');
    if (!ruleLabel.trim()) newErrors.push('Label is required');
    if (rulePriority < 1) newErrors.push('Priority must be at least 1');

    const validateConditions = (group: RuleGroup): boolean => {
      return group.conditions.every(condition => {
        if (condition.type === 'condition') {
          const cond = condition as RuleCondition;
          if (!cond.key || !cond.operator || cond.value === '') {
            newErrors.push('All condition fields must be filled');
            return false;
          }
          if (!availableKeys.includes(cond.key)) {
            newErrors.push(`Key "${cond.key}" is not available in the JSON schema`);
            return false;
          }
        } else if (condition.type === 'group') {
          return validateConditions(condition as RuleGroup);
        }
        return true;
      });
    };

    validateConditions(conditions);
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateRule()) return;

    setIsSubmitting(true);
    try {
      const ruleData = {
        name: ruleName.trim(),
        label: ruleLabel.trim(),
        priority: rulePriority,
        conditions,
        enabled: true
      };

      if (selectedRule) {
        await onRuleUpdate({ ...selectedRule, ...ruleData });
      } else {
        await onRuleCreate(ruleData);
      }

      resetForm();
    } catch (error) {
      setErrors(['Failed to save rule. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addCondition = (groupPath: number[] = []) => {
    const newConditions = { ...conditions };
    let currentGroup = newConditions;
    
    groupPath.forEach(index => {
      currentGroup = currentGroup.conditions[index] as RuleGroup;
    });

    currentGroup.conditions.push({
      type: 'condition',
      key: '',
      operator: '=',
      value: ''
    });

    setConditions(newConditions);
  };

  const removeCondition = (groupPath: number[], conditionIndex: number) => {
    const newConditions = { ...conditions };
    let currentGroup = newConditions;
    
    groupPath.forEach(index => {
      currentGroup = currentGroup.conditions[index] as RuleGroup;
    });

    if (currentGroup.conditions.length > 1) {
      currentGroup.conditions.splice(conditionIndex, 1);
      setConditions(newConditions);
    }
  };

  const updateCondition = (groupPath: number[], conditionIndex: number, field: string, value: string) => {
    const newConditions = { ...conditions };
    let currentGroup = newConditions;
    
    groupPath.forEach(index => {
      currentGroup = currentGroup.conditions[index] as RuleGroup;
    });

    const condition = currentGroup.conditions[conditionIndex] as RuleCondition;
    (condition as any)[field] = value;

    setConditions(newConditions);
  };

  const addGroup = (groupPath: number[] = []) => {
    const newConditions = { ...conditions };
    let currentGroup = newConditions;
    
    groupPath.forEach(index => {
      currentGroup = currentGroup.conditions[index] as RuleGroup;
    });

    currentGroup.conditions.push({
      type: 'group',
      operator: 'AND',
      conditions: [{
        type: 'condition',
        key: '',
        operator: '=',
        value: ''
      }]
    });

    setConditions(newConditions);
  };

  const updateGroupOperator = (groupPath: number[], operator: 'AND' | 'OR') => {
    const newConditions = { ...conditions };
    let currentGroup = newConditions;
    
    groupPath.forEach(index => {
      currentGroup = currentGroup.conditions[index] as RuleGroup;
    });

    currentGroup.operator = operator;
    setConditions(newConditions);
  };

  const renderCondition = (condition: RuleCondition, groupPath: number[], conditionIndex: number) => (
    <div key={conditionIndex} className={`flex items-center space-x-2 p-3 rounded-lg transition-colors duration-200 ${
      isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
    }`}>
      <select
        value={condition.key}
        onChange={(e) => updateCondition(groupPath, conditionIndex, 'key', e.target.value)}
        className={`flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
          isDarkMode 
            ? 'border-gray-600 bg-gray-600 text-white' 
            : 'border-gray-300 bg-white text-gray-900'
        }`}
      >
        <option value="">Select key...</option>
        {availableKeys.map(key => (
          <option key={key} value={key}>{key}</option>
        ))}
      </select>

      <select
        value={condition.operator}
        onChange={(e) => updateCondition(groupPath, conditionIndex, 'operator', e.target.value)}
        className={`p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
          isDarkMode 
            ? 'border-gray-600 bg-gray-600 text-white' 
            : 'border-gray-300 bg-white text-gray-900'
        }`}
      >
        {operators.map(op => (
          <option key={op.value} value={op.value}>{op.label}</option>
        ))}
      </select>

      <input
        type="text"
        value={condition.value}
        onChange={(e) => updateCondition(groupPath, conditionIndex, 'value', e.target.value)}
        placeholder="Value"
        className={`flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
          isDarkMode 
            ? 'border-gray-600 bg-gray-600 text-white placeholder-gray-400' 
            : 'border-gray-300 bg-white text-gray-900'
        }`}
      />

      <button
        type="button"
        onClick={() => removeCondition(groupPath, conditionIndex)}
        className={`p-2 text-red-600 rounded-md transition-colors ${
          isDarkMode ? 'hover:bg-red-900/20' : 'hover:bg-red-100'
        }`}
      >
        <Minus className="h-4 w-4" />
      </button>
    </div>
  );

  const renderGroup = (group: RuleGroup, groupPath: number[] = []): React.ReactNode => (
    <div className={`space-y-3 p-4 border-2 border-dashed rounded-lg transition-colors duration-200 ${
      isDarkMode ? 'border-gray-600' : 'border-gray-200'
    }`}>
      <div className="flex items-center space-x-2">
        <span className={`text-sm font-medium transition-colors duration-200 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>Group Operator:</span>
        <select
          value={group.operator}
          onChange={(e) => updateGroupOperator(groupPath, e.target.value as 'AND' | 'OR')}
          className={`p-1 border rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
            isDarkMode 
              ? 'border-gray-600 bg-gray-600 text-white' 
              : 'border-gray-300 bg-white text-gray-900'
          }`}
        >
          <option value="AND">AND</option>
          <option value="OR">OR</option>
        </select>
      </div>

      {group.conditions.map((condition, index) => (
        <div key={index}>
          {condition.type === 'condition' 
            ? renderCondition(condition as RuleCondition, groupPath, index)
            : renderGroup(condition as RuleGroup, [...groupPath, index])
          }
          {index < group.conditions.length - 1 && (
            <div className="text-center py-1">
              <span className={`text-sm font-medium px-2 py-1 rounded transition-colors duration-200 ${
                isDarkMode ? 'text-blue-300 bg-blue-900/30' : 'text-blue-600 bg-blue-100'
              }`}>
                {group.operator}
              </span>
            </div>
          )}
        </div>
      ))}

      <div className="flex space-x-2">
        <button
          type="button"
          onClick={() => addCondition(groupPath)}
          className={`flex items-center space-x-1 px-3 py-1 text-sm rounded-md transition-colors ${
            isDarkMode 
              ? 'bg-blue-900/30 text-blue-300 hover:bg-blue-900/50' 
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }`}
        >
          <Plus className="h-4 w-4" />
          <span>Add Condition</span>
        </button>
        <button
          type="button"
          onClick={() => addGroup(groupPath)}
          className={`flex items-center space-x-1 px-3 py-1 text-sm rounded-md transition-colors ${
            isDarkMode 
              ? 'bg-green-900/30 text-green-300 hover:bg-green-900/50' 
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          <Plus className="h-4 w-4" />
          <span>Add Group</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-200 ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center space-x-2 mb-6">
        <Settings className="h-5 w-5 text-blue-600" />
        <h3 className={`text-lg font-semibold transition-colors duration-200 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          {selectedRule ? 'Edit Rule' : 'Rule Builder'}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Rule Name
            </label>
            <input
              type="text"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                isDarkMode 
                  ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                  : 'border-gray-300 bg-white text-gray-900'
              }`}
              placeholder="Enter rule name"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Label
            </label>
            <input
              type="text"
              value={ruleLabel}
              onChange={(e) => setRuleLabel(e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                isDarkMode 
                  ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                  : 'border-gray-300 bg-white text-gray-900'
              }`}
              placeholder="e.g., Green, Red, High Priority"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority
          </label>
          <input
            type="number"
            min="1"
            value={rulePriority}
            onChange={(e) => setRulePriority(parseInt(e.target.value) || 1)}
            className="w-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-1">Higher numbers = higher priority</p>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-4 transition-colors duration-200 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Conditions
          </label>
          {renderGroup(conditions)}
        </div>

        {errors.length > 0 && (
          <div className={`border rounded-lg p-4 transition-colors duration-200 ${
            isDarkMode 
              ? 'bg-red-900/20 border-red-800' 
              : 'bg-red-50 border-red-200'
          }`}>
            <h4 className={`text-sm font-medium mb-2 transition-colors duration-200 ${
              isDarkMode ? 'text-red-300' : 'text-red-800'
            }`}>Please fix the following errors:</h4>
            <ul className={`list-disc list-inside text-sm transition-colors duration-200 ${
              isDarkMode ? 'text-red-400' : 'text-red-700'
            }`}>
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={isSubmitting || availableKeys.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>{isSubmitting ? 'Saving...' : selectedRule ? 'Update Rule' : 'Create Rule'}</span>
          </button>

          {selectedRule && (
            <button
              type="button"
              onClick={onCancel}
              className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
                isDarkMode 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </button>
          )}
        </div>
      </form>

      {availableKeys.length === 0 && (
        <div className={`mt-4 p-4 border rounded-lg transition-colors duration-200 ${
          isDarkMode 
            ? 'bg-yellow-900/20 border-yellow-800' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <p className={`text-sm transition-colors duration-200 ${
            isDarkMode ? 'text-yellow-300' : 'text-yellow-800'
          }`}>
            Please provide a valid JSON payload first to extract available keys for rule building.
          </p>
        </div>
      )}
    </div>
  );
};

export default RuleBuilder;