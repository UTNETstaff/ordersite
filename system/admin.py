from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import *

# https://qiita.com/okoppe8/items/10ae61808dc3056f9c8e
# dir(UserAdmin) -> see UserAdmin.fieldsets
#@admin.register(User)
class AdminUserAdmin(UserAdmin):
    fieldsets = (
      (None, {'fields': ('username', 'password')}),
      ('Personal info', {'fields': ('last_name', 'first_name', 'email','tel','syozoku')}),
      ('Permissions',
         {'fields': ('is_active',
                         'is_staff',
                         'is_superuser',
                         'groups',
                         'user_permissions')}),
      ('Important dates', {'fields': ('last_login', 'date_joined')}))
    list_display = ('username','last_name','first_name','email','syozoku')

class BudCodeAdmin(admin.ModelAdmin):
    list_display = ('code','name')#,'syozoku')

class DepCodeAdmin(admin.ModelAdmin):
    list_display = ('code','name')#,'syozoku')

class ProCodeAdmin(admin.ModelAdmin):
    list_display = ('code','name')#,'syozoku')

class OrderAdmin(admin.ModelAdmin):
    list_display = ('nendo','department','bango','item_name','suuryou','kingaku','syozoku')

#admin.site.register(User,UserAdmin)
admin.site.register(User,AdminUserAdmin)
admin.site.register(syozoku)
admin.site.register(BudCode,BudCodeAdmin)
admin.site.register(ProCode,ProCodeAdmin)
admin.site.register(Bumon)
admin.site.register(DepCode,DepCodeAdmin)
admin.site.register(Order,OrderAdmin)
admin.site.register(order_status)
admin.site.register(unit)
admin.site.register(tax)
