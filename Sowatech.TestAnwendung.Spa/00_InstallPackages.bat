@echo ==========================================================================
@echo Install npm packages
@echo ==========================================================================
call npm install
@echo ==========================================================================
@echo Update webdriver-manager
@echo ==========================================================================
call .\node_modules\protractor\node_modules\.bin\webdriver-manager update
@echo ==========================================================================
@echo Ready
@echo ==========================================================================
pause