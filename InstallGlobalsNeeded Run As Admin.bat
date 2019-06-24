@echo ==========================================================================

@echo Update npm
@echo ==========================================================================
call npm install npm -g

@echo Install Angular CLI
@echo ==========================================================================
call npm install -g @angular/cli

@echo Install copyfiles package
@echo ==========================================================================
call npm install -g copyfiles

pause
