import React, { useState, useEffect } from 'react';
import JsonInput from '../components/JsonInput';
import RuleBuilder from '../components/RuleBuilder';
import RulesList from '../components/RulesList';
import { Rule } from '../types/Rule';
import { ruleService } from '../services/ruleService';

const ConfigurationPage: React.FC = () => {
  const [jsonKeys, setJsonKeys] = useState<string[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      setIsLoading(true);
      const rulesData = await ruleService.getRules();
      setRules(rulesData);
      
      // Initialize with sample JSON keys if no rules exist and not already initialized
      if (rulesData.length > 0 && !hasInitialized) {
        const sampleKeys = [
          'CompanyName', 'Product', 'Size', 'Price', 'Currency', 
          'Weight', 'BatchID', 'MFGUnit', 'Quantity', 'MOQ'
        ];
        setJsonKeys(sampleKeys);
        setHasInitialized(true);
      }
    } catch (error) {
      console.error('Failed to load rules:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJsonKeysChange = (keys: string[]) => {
    setJsonKeys(keys);
  };

  const handleRuleCreate = async (rule: Omit<Rule, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newRule = await ruleService.createRule(rule);
      setRules([...rules, newRule]);
      setSelectedRule(null);
    } catch (error) {
      console.error('Failed to create rule:', error);
      throw error;
    }
  };

  const handleRuleUpdate = async (rule: Rule) => {
    try {
      const updatedRule = await ruleService.updateRule(rule.id, rule);
      setRules(rules.map(r => r.id === rule.id ? updatedRule : r));
      setSelectedRule(null);
    } catch (error) {
      console.error('Failed to update rule:', error);
      throw error;
    }
  };

  const handleRuleDelete = async (ruleId: string) => {
    try {
      await ruleService.deleteRule(ruleId);
      setRules(rules.filter(r => r.id !== ruleId));
      if (selectedRule?.id === ruleId) {
        setSelectedRule(null);
      }
    } catch (error) {
      console.error('Failed to delete rule:', error);
      throw error;
    }
  };

  const handleRuleToggle = async (ruleId: string) => {
    try {
      const updatedRule = await ruleService.toggleRule(ruleId);
      setRules(rules.map(r => r.id === ruleId ? updatedRule : r));
    } catch (error) {
      console.error('Failed to toggle rule:', error);
      throw error;
    }
  };

  const handleRuleEdit = (rule: Rule) => {
    setSelectedRule(rule);
  };

  const handleCancelEdit = () => {
    setSelectedRule(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Configuration</h2>
        <p className="text-gray-600">
          Configure data labeling rules by providing sample JSON and defining custom labeling logic.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-8">
          <JsonInput onKeysChange={handleJsonKeysChange} rules={rules} />
          
          <RuleBuilder
            availableKeys={jsonKeys}
            selectedRule={selectedRule}
            onRuleCreate={handleRuleCreate}
            onRuleUpdate={handleRuleUpdate}
            onCancel={handleCancelEdit}
          />
        </div>

        <div>
          <RulesList
            rules={rules}
            onRuleEdit={handleRuleEdit}
            onRuleDelete={handleRuleDelete}
            onRuleToggle={handleRuleToggle}
          />
        </div>
      </div>
    </div>
  );
};

export default ConfigurationPage;