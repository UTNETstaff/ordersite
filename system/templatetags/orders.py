from django import template
from datetime import datetime,timedelta
import os

register = template.Library()

@register.filter(name='digit3')
def datej(value,default=""):
    if value is not None:
        return '{0:,}'.format(int(value))

@register.filter(name='getfilename')
def get_filename(value):
    return os.path.basename(value.file.name)
