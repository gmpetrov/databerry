<?php
/**
 * AdminChainDeskController.php
 *
 * This file contains the AdminChainDeskController class, which is responsible for handling
 * administrative functions related to the ChainDesk module in PrestaShop.
 *
 * @author chaindesk
 * @copyright chaindesk
 * @license MIT License
 */
if (!defined('_PS_VERSION_')) {
    exit;
}

class AdminChainDeskController extends ModuleAdminController
{
    public function __construct()
    {
        parent::__construct();
    }

    public function initContent()
    {
        $agentId = $this->getAgentIdFromUrl();

        $this->assignTemplateData($agentId);

        $this->content .= $this->context->smarty->fetch(
            $this->getTemplatePath() . 'chaindesk.tpl'
        );

        parent::initContent();
    }

    private function getAgentIdFromUrl()
    {
        if (Tools::getIsset('agentId')) {
            $sanitizedAgentId = pSQL(Tools::getValue('agentId'));
            Configuration::updateValue('CHAINDESK_AGENT_ID', $sanitizedAgentId);

            return $sanitizedAgentId;
        }

        return Configuration::get('CHAINDESK_AGENT_ID');
    }

    private function assignTemplateData($agentId)
    {
        $this->context->smarty->assign([
            'add_to_chaindesk_link' => $this->generateChainDeskLink(),
            'agentId' => $agentId,
        ]);
    }

    private function generateChainDeskLink()
    {
        $agentId = Configuration::get('CHAINDESK_AGENT_ID');
        $http_callback = Tools::getShopDomainSsl(true, true) . $_SERVER['REQUEST_URI'];
        $base_url = 'https://app.chaindesk.ai'; // Use single quotes for simple strings

        return $base_url . '/integrations/prestashop/config?callback=' . urlencode($http_callback) . '&siteurl=' . urlencode(Tools::getShopDomainSsl(true, true)) . '&agentId=' . $agentId;
    }
}
