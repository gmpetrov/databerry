<?php
/**
 * chaindesk.php
 *
 * This file is the main entry point for the ChainDesk module in PrestaShop.
 * It initializes and configures the module.
 *
 * @author chaindesk
 * @copyright chaindesk
 * @license MIT License
 */
if (!defined('_PS_VERSION_')) {
    exit;
}

class Chaindesk extends Module
{
    public function __construct()
    {
        $this->module_key = '939dd04147febe539250e68dbe55df68';
        $this->name = 'chaindesk';
        $this->tab = 'front_office_features';
        $this->version = '1.0.0';
        $this->author = 'chaindesk';
        $this->need_instance = 0;
        $this->ps_versions_compliancy = [
            'min' => '1.7.0.0',
            'max' => '8.99.99',
        ];
        $this->bootstrap = true;

        parent::__construct();

        $this->displayName = $this->l('chaindesk');
        $this->description = $this->l('chaindesk.');

        $this->confirmUninstall = $this->l('Are you sure you want to uninstall?');

        if (!Configuration::get('MYMODULE_NAME')) {
            $this->warning = $this->l('No name provided');
        }
    }

    public function install()
    {
        if (Shop::isFeatureActive()) {
            Shop::setContext(Shop::CONTEXT_ALL);
        }

        return parent::install() && $this->registerHooks() && $this->installTab() && Configuration::updateValue('MYMODULE_NAME', 'chaindesk');
    }

    private function registerHooks()
    {
        return $this->registerHook('displayHeader') && $this->registerHook('hookHeader');
    }

    public function installTab()
    {
        $tab = new Tab();
        $tab->active = 1;
        $tab->class_name = 'AdminChainDesk';
        $tab->name = [];

        foreach (Language::getLanguages(true) as $lang) {
            $tab->name[$lang['id_lang']] = 'Chaindesk';
        }

        $tab->id_parent = (int) Tab::getIdFromClassName('AdminAdmin');
        $tab->module = $this->name;
        return $tab->add();
    }

    public function uninstall()
    {
        return parent::uninstall();
    }

    public function hookHeader()
    {
        // Sanitize and validate the agent ID.
        $agentId = Configuration::get('CHAINDESK_AGENT_ID');
        $agentId = Tools::safeOutput($agentId);

        if (!empty($agentId) && !Tools::isSubmit('chaindesk_script_enqueued')) {
            $output = '<script
                data-cfasync="false"
                data-name="databerry-chat-bubble"
                id="' . $agentId . '"
                src="https://cdn.jsdelivr.net/npm/@databerry/chat-bubble@latest"
            ></script>';

            $output .= '<script>var chaindesk_script_enqueued = true;</script>';

            return $output;
        }
    }
}
