# -*- coding: utf-8 -*-
from django import template
from django.conf import settings

register = template.Library()

@register.simple_tag
def dump(obj):
    """
    使い方。テンプレートレイヤーで
    {% load debug_extra %}
    {% dump obj %}
    とすると、objの中身がダンプされる。
    """
    # DEBUGモードでのみ有効
    if not settings.DEBUG:
        return

    l = dir(obj)
    dump_data = "dump " + str(obj).replace("<", "&lt;").replace(">", "&gt;") + "<ul>"
    for name in l:
        try:
            v = str(getattr(obj, name)).replace("<", "&lt;").replace(">", "&gt;")
            if "instance" in v:
                s = dump(getattr(obj, name))
            else:
                s = "<li><i>" + name + "</i> : " + v + "</li>"
                dump_data +=  s
        except:
            pass
    return  dump_data + "</ul>"
                                                                
